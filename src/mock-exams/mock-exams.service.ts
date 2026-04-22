import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MockExam } from './entities/mock-exam.entity';
import { MockExamSession } from './entities/mock-exam-session.entity';
import { Question } from '../questions/entities/question.entity';
import { Difficulty } from '../common/enums/practice.enum';
import {
  MockExamListItemDto,
  StartMockExamResponseDto,
  MockExamQuestionDto,
  MockExamResultDto,
  MockExamQuestionResultDto,
} from './dto/mock-exam.dto';

const PASSING_THRESHOLD = 60;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function mapDifficulty(examDifficulty: string): Difficulty | null {
  switch (examDifficulty) {
    case 'easy':
      return Difficulty.EASY;
    case 'intermediate':
      return Difficulty.MEDIUM;
    case 'hard':
      return Difficulty.HARD;
    default:
      return null;
  }
}

interface InMemorySession {
  sessionId: string;
  mockExamId: string;
  userId: string;
  questions: {
    id: string;
    questionText: string;
    options: { key: string; text: string }[];
    correctAnswer: string;
    explanation: string;
  }[];
  answers: Record<string, string>;
  questionIndexMap: Record<string, number>;
  startedAt: Date;
  timeLimitSeconds: number;
}

@Injectable()
export class MockExamsService {
  private readonly activeSessions: Map<string, InMemorySession> = new Map();

  constructor(
    @InjectRepository(MockExam)
    private readonly mockExamRepository: Repository<MockExam>,
    @InjectRepository(MockExamSession)
    private readonly mockExamSessionRepository: Repository<MockExamSession>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  async getAvailableExams(): Promise<MockExamListItemDto[]> {
    const exams = await this.mockExamRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });

    return exams.map((e) => ({
      id: e.id,
      title: e.title,
      name: e.name,
      description: e.description,
      tags: e.tags,
      numberOfQuestions: e.numberOfQuestions,
      difficulty: e.difficulty,
      timeLimitMinutes: e.timeLimitMinutes,
      timesTaken: e.timesTaken,
      averageScore: e.averageScore,
    }));
  }

  async startExam(
    userId: string,
    examId: string,
  ): Promise<StartMockExamResponseDto> {
    const exam = await this.mockExamRepository.findOne({
      where: { id: examId, isActive: true },
    });

    if (!exam) {
      throw new NotFoundException('Mock exam not found');
    }

    const difficulty = mapDifficulty(exam.difficulty);
    const allQuestions = await this.questionRepository.find({
      where: difficulty ? { difficulty } : {},
    });

    if (allQuestions.length === 0) {
      throw new BadRequestException('No questions available for this exam');
    }

    const shuffled = shuffleArray(allQuestions);
    const selected = shuffled.slice(0, exam.numberOfQuestions);

    const storedQuestions = selected.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options.map((opt, idx) => ({
        key: String.fromCharCode(65 + idx),
        text: opt.text || opt.id,
      })),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    }));

    const questionIndexMap: Record<string, number> = {};
    storedQuestions.forEach((q, idx) => {
      questionIndexMap[q.id] = idx;
    });

    const timeLimitSeconds = exam.timeLimitMinutes * 60;

    const dbSession = this.mockExamSessionRepository.create({
      mockExamId: exam.id,
      userId,
      questionIds: storedQuestions.map((q) => q.id),
      answers: {},
      correctAnswers: 0,
      totalQuestions: storedQuestions.length,
      scorePercentage: 0,
      timeSpentSeconds: 0,
      timeLimitSeconds,
      isCompleted: false,
      isPassed: false,
      startedAt: new Date(),
    });
    const savedSession = await this.mockExamSessionRepository.save(dbSession);

    const inMemory: InMemorySession = {
      sessionId: savedSession.id,
      mockExamId: exam.id,
      userId,
      questions: storedQuestions,
      answers: {},
      questionIndexMap,
      startedAt: savedSession.startedAt,
      timeLimitSeconds,
    };
    this.activeSessions.set(savedSession.id, inMemory);

    const questionsForClient: MockExamQuestionDto[] = storedQuestions.map(
      (q, i) => ({
        id: q.id,
        questionNumber: i + 1,
        questionText: q.questionText,
        options: q.options,
        isAnswered: false,
        selectedAnswer: null,
      }),
    );

    return {
      sessionId: savedSession.id,
      mockExamId: exam.id,
      title: exam.title,
      totalQuestions: storedQuestions.length,
      timeLimitSeconds,
      questions: questionsForClient,
      startedAt: savedSession.startedAt.toISOString(),
    };
  }

  getSessionStatus(sessionId: string, userId: string) {
    const session = this.getActiveSession(sessionId, userId);
    const elapsed = Math.floor(
      (Date.now() - session.startedAt.getTime()) / 1000,
    );
    const timeRemaining = Math.max(0, session.timeLimitSeconds - elapsed);

    return {
      sessionId: session.sessionId,
      mockExamId: session.mockExamId,
      totalQuestions: session.questions.length,
      answeredCount: Object.keys(session.answers).length,
      timeRemainingSeconds: timeRemaining,
      timeLimitSeconds: session.timeLimitSeconds,
    };
  }

  getQuestion(
    sessionId: string,
    userId: string,
    questionNumber: number,
  ): MockExamQuestionDto {
    const session = this.getActiveSession(sessionId, userId);

    const index = questionNumber - 1;
    if (index < 0 || index >= session.questions.length) {
      throw new BadRequestException('Invalid question number');
    }

    const q = session.questions[index];
    return {
      id: q.id,
      questionNumber,
      questionText: q.questionText,
      options: q.options,
      isAnswered: q.id in session.answers,
      selectedAnswer: session.answers[q.id] || null,
    };
  }

  submitAnswer(
    sessionId: string,
    userId: string,
    questionId: string,
    answer: string,
  ): {
    questionId: string;
    answer: string;
    answeredCount: number;
    totalQuestions: number;
  } {
    const session = this.getActiveSession(sessionId, userId);

    if (!['A', 'B', 'C', 'D'].includes(answer)) {
      throw new BadRequestException('Invalid answer. Must be A, B, C, or D');
    }

    if (!(questionId in session.questionIndexMap)) {
      throw new NotFoundException('Question not found in this session');
    }

    session.answers[questionId] = answer;

    return {
      questionId,
      answer,
      answeredCount: Object.keys(session.answers).length,
      totalQuestions: session.questions.length,
    };
  }

  async completeExam(
    sessionId: string,
    userId: string,
  ): Promise<MockExamResultDto> {
    const session = this.getActiveSession(sessionId, userId);

    const elapsed = Math.floor(
      (Date.now() - session.startedAt.getTime()) / 1000,
    );
    const timeSpentSeconds = Math.min(elapsed, session.timeLimitSeconds);

    const questionResults: MockExamQuestionResultDto[] = [];
    let correctAnswers = 0;

    for (let i = 0; i < session.questions.length; i++) {
      const q = session.questions[i];
      const userAnswer = session.answers[q.id] || null;
      const isCorrect = userAnswer === q.correctAnswer;

      if (isCorrect) correctAnswers++;

      questionResults.push({
        questionNumber: i + 1,
        questionId: q.id,
        questionText: q.questionText,
        correctAnswer: q.correctAnswer,
        userAnswer,
        isCorrect,
        explanation: q.explanation,
      });
    }

    const totalQuestions = session.questions.length;
    const answeredCount = Object.keys(session.answers).length;
    const incorrectAnswers = answeredCount - correctAnswers;
    const skippedQuestions = totalQuestions - answeredCount;
    const scorePercentage =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100 * 100) / 100
        : 0;
    const isPassed = scorePercentage >= PASSING_THRESHOLD;

    await this.mockExamSessionRepository.update(sessionId, {
      answers: session.answers,
      correctAnswers,
      scorePercentage,
      timeSpentSeconds,
      isCompleted: true,
      isPassed,
      completedAt: new Date(),
    });

    await this.mockExamRepository
      .createQueryBuilder()
      .update(MockExam)
      .set({
        timesTaken: () => 'times_taken + 1',
        averageScore: () =>
          `(average_score * times_taken + ${scorePercentage}) / (times_taken + 1)`,
      })
      .where('id = :id', { id: session.mockExamId })
      .execute();

    this.activeSessions.delete(sessionId);

    return {
      sessionId,
      mockExamId: session.mockExamId,
      title: '',
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      scorePercentage,
      timeSpentSeconds,
      isPassed,
      questionResults,
    };
  }

  private getActiveSession(sessionId: string, userId: string): InMemorySession {
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new NotFoundException('Session not found');
    }

    const elapsed = Math.floor(
      (Date.now() - session.startedAt.getTime()) / 1000,
    );
    if (elapsed >= session.timeLimitSeconds) {
      throw new BadRequestException('Exam time has expired');
    }

    return session;
  }
}

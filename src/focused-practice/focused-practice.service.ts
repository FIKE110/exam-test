import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Difficulty,
  SessionStatus,
  SessionType,
} from '../common/enums/practice.enum';
import { PracticeSession } from '../practice/entities/practice-session.entity';
import { SessionAnswer } from '../practice/entities/session-answer.entity';
import { Question } from '../questions/entities/question.entity';
import { Course } from '../courses/entities/course.entity';
import { StartPracticeDto, QuestionCount } from './dto/start-practice.dto';
import {
  CoursesListDto,
  DifficultyOptionDto,
} from './dto/practice-response.dto';
import {
  TestQuestionDto,
  TestSessionStatusDto,
  TestResultDto,
  QuestionResultDto,
  SessionResumeDto,
} from './dto/test-session.dto';

interface StoredQuestion {
  id: string;
  questionText: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

interface StoredSession {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  difficulty: Difficulty;
  questions: StoredQuestion[];
  answers: Map<number, string>;
  currentQuestionIndex: number;
  startedAt: Date;
  totalTimeSeconds: number;
  isCompleted: boolean;
  status: SessionStatus;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

@Injectable()
export class FocusedPracticeService {
  private readonly difficulties: DifficultyOptionDto[] = [
    { value: Difficulty.EASY, label: 'Easy' },
    { value: Difficulty.MEDIUM, label: 'Medium' },
    { value: Difficulty.HARD, label: 'Hard' },
  ];

  private readonly activeSessions: Map<string, StoredSession> = new Map();

  constructor(
    @InjectRepository(PracticeSession)
    private readonly practiceSessionRepository: Repository<PracticeSession>,
    @InjectRepository(SessionAnswer)
    private readonly sessionAnswerRepository: Repository<SessionAnswer>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async getCourses(): Promise<CoursesListDto[]> {
    const courses = await this.courseRepository.find({
      where: { isActive: true },
      select: ['id', 'title', 'slug', 'description'],
    });
    return courses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
    }));
  }

  getDifficultyOptions(): DifficultyOptionDto[] {
    return this.difficulties;
  }

  getQuestionCountOptions(): number[] {
    return [QuestionCount.TEN, QuestionCount.TWENTY, QuestionCount.FIFTY];
  }

  async startPractice(
    userId: string,
    dto: StartPracticeDto,
  ): Promise<{
    sessionId: string;
    courseTitle: string;
    difficulty: Difficulty;
    questionCount: number;
    questions: TestQuestionDto[];
    startedAt: string;
  }> {
    const course = await this.courseRepository.findOne({
      where: { id: dto.courseId, isActive: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const allQuestions = await this.questionRepository.find({
      where: {
        courseId: dto.courseId,
        difficulty: dto.difficulty,
      },
    });

    const shuffled = shuffleArray(allQuestions);
    const selected = shuffled.slice(0, dto.questionCount);

    const storedQuestions: StoredQuestion[] =
      selected.length > 0
        ? selected.map((q) => ({
            id: q.id,
            questionText: q.questionText,
            options: q.options.map((opt, idx) => ({
              key: String.fromCharCode(65 + idx),
              text: opt.text || opt.id,
            })),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          }))
        : this.generateMockQuestions(
            dto.courseId,
            dto.difficulty,
            dto.questionCount,
          );

    const totalTimeSeconds = dto.questionCount * 30;

    const dbSession = this.practiceSessionRepository.create({
      userId,
      sessionType: SessionType.FOCUSED,
      courseId: dto.courseId,
      difficulty: dto.difficulty,
      totalQuestions: storedQuestions.length,
      totalAnswered: 0,
      correctAnswers: 0,
      timeLimitMinutes: Math.ceil(totalTimeSeconds / 60),
      timeSpentSeconds: 0,
      status: SessionStatus.IN_PROGRESS,
      startedAt: new Date(),
    });
    const savedSession = await this.practiceSessionRepository.save(dbSession);

    const session: StoredSession = {
      id: savedSession.id,
      userId,
      courseId: dto.courseId,
      courseTitle: course.title,
      difficulty: dto.difficulty,
      questions: storedQuestions,
      answers: new Map(),
      currentQuestionIndex: 0,
      startedAt: savedSession.startedAt,
      totalTimeSeconds,
      isCompleted: false,
      status: SessionStatus.IN_PROGRESS,
    };

    this.activeSessions.set(savedSession.id, session);

    const questions = storedQuestions.map((q, i) => ({
      id: q.id,
      questionNumber: i + 1,
      questionText: q.questionText,
      options: q.options,
      isAnswered: false,
      selectedAnswer: null,
    }));

    return {
      sessionId: savedSession.id,
      courseTitle: course.title,
      difficulty: dto.difficulty,
      questionCount: dto.questionCount,
      questions,
      startedAt: savedSession.startedAt.toISOString(),
    };
  }

  getSession(sessionId: string, userId: string): TestSessionStatusDto {
    const session = this.getActiveSession(sessionId, userId);
    const timeRemaining = this.calculateTimeRemaining(session);

    return {
      sessionId: session.id,
      courseTitle: session.courseTitle,
      difficulty: session.difficulty,
      totalQuestions: session.questions.length,
      currentQuestionNumber: session.currentQuestionIndex + 1,
      answeredCount: session.answers.size,
      timeRemainingSeconds: timeRemaining,
      totalTimeSeconds: session.totalTimeSeconds,
      isCompleted: session.isCompleted,
      answeredQuestionNumbers: Array.from(session.answers.keys()).map(
        (i) => i + 1,
      ),
    };
  }

  async resumeSession(
    sessionId: string,
    userId: string,
  ): Promise<SessionResumeDto> {
    const dbSession = await this.practiceSessionRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!dbSession) {
      throw new NotFoundException('Session not found');
    }

    if (dbSession.status === SessionStatus.COMPLETED) {
      throw new BadRequestException('Session is already completed');
    }

    const timeRemaining = this.calculateTimeRemainingFromDate(
      dbSession.startedAt,
      (dbSession.timeLimitMinutes || 10) * 60,
    );
    if (timeRemaining <= 0) {
      throw new BadRequestException('Session has expired');
    }

    const existingSession = this.activeSessions.get(sessionId);
    if (existingSession) {
      const questions = existingSession.questions.map((q, i) => ({
        id: q.id,
        questionNumber: i + 1,
        questionText: q.questionText,
        options: q.options,
        isAnswered: existingSession.answers.has(i),
        selectedAnswer: existingSession.answers.get(i) || null,
      }));

      const userAnswers: Record<number, string | null> = {};
      existingSession.answers.forEach((answer, index) => {
        userAnswers[index] = answer;
      });

      return {
        sessionId: existingSession.id,
        courseId: existingSession.courseId,
        courseTitle: existingSession.courseTitle,
        difficulty: existingSession.difficulty,
        questionCount: existingSession.questions.length,
        currentQuestionNumber: existingSession.currentQuestionIndex + 1,
        timeRemainingSeconds: this.calculateTimeRemainingFromDate(
          existingSession.startedAt,
          existingSession.totalTimeSeconds,
        ),
        totalTimeSeconds: existingSession.totalTimeSeconds,
        isCompleted: existingSession.isCompleted,
        questions,
        userAnswers,
      };
    }

    const course = await this.courseRepository.findOne({
      where: { id: dbSession.courseId },
    });

    const difficulty = dbSession.difficulty || Difficulty.MEDIUM;

    const allQuestions = await this.questionRepository.find({
      where: { courseId: dbSession.courseId, difficulty },
    });

    const shuffled = shuffleArray(allQuestions);
    const selected = shuffled.slice(0, dbSession.totalQuestions);

    const storedQuestions: StoredQuestion[] =
      selected.length > 0
        ? selected.map((q) => ({
            id: q.id,
            questionText: q.questionText,
            options: q.options.map((opt, idx) => ({
              key: String.fromCharCode(65 + idx),
              text: opt.text || opt.id,
            })),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          }))
        : this.generateMockQuestions(
            dbSession.courseId,
            difficulty,
            dbSession.totalQuestions,
          );

    const sessionAnswers = await this.sessionAnswerRepository.find({
      where: { sessionId },
    });

    const answersMap = new Map<number, string>();
    sessionAnswers.forEach((sa) => {
      const index = storedQuestions.findIndex((q) => q.id === sa.questionId);
      if (index !== -1) {
        answersMap.set(index, sa.selectedAnswer);
      }
    });

    const restoredSession: StoredSession = {
      id: dbSession.id,
      userId,
      courseId: dbSession.courseId,
      courseTitle: course?.title || '',
      difficulty: difficulty || Difficulty.MEDIUM,
      questions: storedQuestions,
      answers: answersMap,
      currentQuestionIndex: answersMap.size,
      startedAt: dbSession.startedAt,
      totalTimeSeconds: (dbSession.timeLimitMinutes || 10) * 60,
      isCompleted: false,
      status: SessionStatus.IN_PROGRESS,
    };

    this.activeSessions.set(sessionId, restoredSession);

    const questions = storedQuestions.map((q, i) => ({
      id: q.id,
      questionNumber: i + 1,
      questionText: q.questionText,
      options: q.options,
      isAnswered: answersMap.has(i),
      selectedAnswer: answersMap.get(i) || null,
    }));

    const userAnswers: Record<number, string | null> = {};
    answersMap.forEach((answer, index) => {
      userAnswers[index] = answer;
    });

    return {
      sessionId: dbSession.id,
      courseId: dbSession.courseId,
      courseTitle: course?.title || '',
      difficulty: difficulty || Difficulty.MEDIUM,
      questionCount: storedQuestions.length,
      currentQuestionNumber: answersMap.size + 1,
      timeRemainingSeconds: this.calculateTimeRemainingFromDate(
        dbSession.startedAt,
        (dbSession.timeLimitMinutes || 10) * 60,
      ),
      totalTimeSeconds: (dbSession.timeLimitMinutes || 10) * 60,
      isCompleted: false,
      questions,
      userAnswers,
    };
  }

  private calculateTimeRemainingFromDate(startedAt: Date, totalSeconds: number): number {
    const elapsedSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);
    return Math.max(0, totalSeconds - elapsedSeconds);
  }

  getCurrentQuestion(sessionId: string, userId: string): TestQuestionDto {
    const session = this.getActiveSession(sessionId, userId);

    if (session.currentQuestionIndex >= session.questions.length) {
      throw new BadRequestException('No more questions available');
    }

    const question = session.questions[session.currentQuestionIndex];
    const questionNumber = session.currentQuestionIndex + 1;
    const userAnswer =
      session.answers.get(session.currentQuestionIndex) || null;

    return {
      id: question.id,
      questionNumber,
      questionText: question.questionText,
      options: question.options,
      isAnswered: userAnswer !== null,
      selectedAnswer: userAnswer,
    };
  }

  async submitAnswer(
    sessionId: string,
    userId: string,
    answer: string,
  ): Promise<TestQuestionDto> {
    const session = this.getActiveSession(sessionId, userId);

    if (session.isCompleted) {
      throw new BadRequestException('Session is already completed');
    }

    if (!['A', 'B', 'C', 'D'].includes(answer)) {
      throw new BadRequestException('Invalid answer. Must be A, B, C, or D');
    }

    session.answers.set(session.currentQuestionIndex, answer);

    const question = session.questions[session.currentQuestionIndex];
    const isCorrect = answer === question.correctAnswer;

    const existing = await this.sessionAnswerRepository.findOne({
      where: { sessionId, questionId: question.id },
    });

    if (existing) {
      existing.selectedAnswer = answer;
      existing.isCorrect = isCorrect;
      existing.answeredAt = new Date();
      await this.sessionAnswerRepository.save(existing);
    } else {
      const dbAnswer = this.sessionAnswerRepository.create({
        sessionId,
        questionId: question.id,
        selectedAnswer: answer,
        isCorrect,
        timeSpentSeconds: 0,
        isFlagged: false,
        answeredAt: new Date(),
      });
      await this.sessionAnswerRepository.save(dbAnswer);
    }

    return this.getCurrentQuestion(sessionId, userId);
  }

  async submitAllAnswers(
    sessionId: string,
    userId: string,
    answers: Record<number, string>,
  ): Promise<TestResultDto> {
    const dbSession = await this.practiceSessionRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!dbSession) {
      throw new BadRequestException('Session not found');
    }

    const difficulty = dbSession.difficulty || Difficulty.MEDIUM;

    let session = this.activeSessions.get(sessionId);

    if (!session) {
      const course = await this.courseRepository.findOne({
        where: { id: dbSession.courseId },
      });

      const allQuestions = await this.questionRepository.find({
        where: { courseId: dbSession.courseId, difficulty },
      });

      const shuffled = shuffleArray(allQuestions);
      const selected = shuffled.slice(0, dbSession.totalQuestions);

      const storedQuestions: StoredQuestion[] =
        selected.length > 0
          ? selected.map((q) => ({
              id: q.id,
              questionText: q.questionText,
              options: q.options.map((opt, idx) => ({
                key: String.fromCharCode(65 + idx),
                text: opt.text || opt.id,
              })),
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
            }))
          : this.generateMockQuestions(
              dbSession.courseId,
              difficulty,
              dbSession.totalQuestions,
            );

      const answersMap = new Map<number, string>();
      Object.entries(answers).forEach(([index, answer]) => {
        const idx = parseInt(index, 10);
        if (idx >= 0 && idx < storedQuestions.length && ['A', 'B', 'C', 'D'].includes(answer)) {
          answersMap.set(idx, answer);
        }
      });

      const newSession: StoredSession = {
        id: dbSession.id,
        userId,
        courseId: dbSession.courseId,
        courseTitle: course?.title || '',
        difficulty: difficulty,
        questions: storedQuestions,
        answers: answersMap,
        currentQuestionIndex: answersMap.size,
        startedAt: dbSession.startedAt,
        totalTimeSeconds: (dbSession.timeLimitMinutes || 10) * 60,
        isCompleted: false,
        status: SessionStatus.IN_PROGRESS,
      };

      this.activeSessions.set(sessionId, newSession);
      session = newSession;
    }

    if (!session) {
      throw new BadRequestException('Session not found');
    }

    if (session.isCompleted === false) {
      Object.entries(answers).forEach(([index, answer]) => {
        const idx = parseInt(index, 10);
        if (idx >= 0 && idx < session.questions.length && ['A', 'B', 'C', 'D'].includes(answer)) {
          session.answers.set(idx, answer);
        }
      });
    }

    const questionResults: QuestionResultDto[] = [];
    let correctAnswers = 0;

    for (let i = 0; i < session.questions.length; i++) {
      const question = session.questions[i];
      const userAnswer = session.answers.get(i) || null;
      const isCorrect = userAnswer === question.correctAnswer;

      if (userAnswer) {
        const existing = await this.sessionAnswerRepository.findOne({
          where: { sessionId, questionId: question.id },
        });

        if (existing) {
          existing.selectedAnswer = userAnswer;
          existing.isCorrect = isCorrect;
          existing.answeredAt = new Date();
          await this.sessionAnswerRepository.save(existing);
        } else {
          const dbAnswer = this.sessionAnswerRepository.create({
            sessionId,
            questionId: question.id,
            selectedAnswer: userAnswer,
            isCorrect,
            timeSpentSeconds: 0,
            isFlagged: false,
            answeredAt: new Date(),
          });
          await this.sessionAnswerRepository.save(dbAnswer);
        }
      }

      if (isCorrect) correctAnswers++;

      questionResults.push({
        questionNumber: i + 1,
        questionText: question.questionText,
        correctAnswer: question.correctAnswer,
        userAnswer,
        isCorrect,
        explanation: question.explanation,
      });
    }

    const totalQuestions = session.questions.length;
    const answeredCount = session.answers.size;
    const incorrectAnswers = answeredCount - correctAnswers;
    const skippedQuestions = totalQuestions - answeredCount;
    const timeSpentSeconds = Math.min(
      Math.floor((Date.now() - session.startedAt.getTime()) / 1000),
      session.totalTimeSeconds,
    );
    const accuracyPercentage =
      answeredCount > 0
        ? Math.round((correctAnswers / answeredCount) * 100)
        : 0;

    await this.practiceSessionRepository.update(sessionId, {
      totalAnswered: answeredCount,
      correctAnswers,
      accuracyPercentage,
      timeSpentSeconds,
      status: SessionStatus.COMPLETED,
      completedAt: new Date(),
    });

    this.activeSessions.delete(sessionId);

    return {
      sessionId: session.id,
      courseTitle: session.courseTitle,
      difficulty: session.difficulty,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      accuracyPercentage,
      timeSpentSeconds,
      questionResults,
    };
  }

  nextQuestion(
    sessionId: string,
    userId: string,
    questionNumber?: number,
  ): TestQuestionDto {
    const session = this.getActiveSession(sessionId, userId);

    if (session.isCompleted) {
      throw new BadRequestException('Session is already completed');
    }

    if (questionNumber !== undefined) {
      const targetIndex = questionNumber - 1;
      if (targetIndex < 0 || targetIndex >= session.questions.length) {
        throw new BadRequestException('Invalid question number');
      }
      session.currentQuestionIndex = targetIndex;
    } else {
      if (session.currentQuestionIndex < session.questions.length - 1) {
        session.currentQuestionIndex++;
      } else {
        throw new BadRequestException('Already at the last question');
      }
    }

    return this.getCurrentQuestion(sessionId, userId);
  }

  previousQuestion(sessionId: string, userId: string): TestQuestionDto {
    const session = this.getActiveSession(sessionId, userId);

    if (session.isCompleted) {
      throw new BadRequestException('Session is already completed');
    }

    if (session.currentQuestionIndex > 0) {
      session.currentQuestionIndex--;
    } else {
      throw new BadRequestException('Already at the first question');
    }

    return this.getCurrentQuestion(sessionId, userId);
  }

  async completeSession(
    sessionId: string,
    userId: string,
  ): Promise<TestResultDto> {
    const session = this.getActiveSession(sessionId, userId);

    session.isCompleted = true;
    session.status = SessionStatus.COMPLETED;

    const questionResults: QuestionResultDto[] = [];
    let correctAnswers = 0;

    for (let i = 0; i < session.questions.length; i++) {
      const question = session.questions[i];
      const userAnswer = session.answers.get(i) || null;
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) correctAnswers++;

      questionResults.push({
        questionNumber: i + 1,
        questionText: question.questionText,
        correctAnswer: question.correctAnswer,
        userAnswer,
        isCorrect,
        explanation: question.explanation,
      });
    }

    const totalQuestions = session.questions.length;
    const answeredCount = session.answers.size;
    const incorrectAnswers = answeredCount - correctAnswers;
    const skippedQuestions = totalQuestions - answeredCount;
    const timeSpentSeconds = Math.min(
      Math.floor((Date.now() - session.startedAt.getTime()) / 1000),
      session.totalTimeSeconds,
    );
    const accuracyPercentage =
      answeredCount > 0
        ? Math.round((correctAnswers / answeredCount) * 100)
        : 0;

    await this.practiceSessionRepository.update(session.id, {
      totalAnswered: answeredCount,
      correctAnswers,
      accuracyPercentage,
      timeSpentSeconds,
      status: SessionStatus.COMPLETED,
      completedAt: new Date(),
    });

    this.activeSessions.delete(sessionId);

    return {
      sessionId: session.id,
      courseTitle: session.courseTitle,
      difficulty: session.difficulty,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      accuracyPercentage,
      timeSpentSeconds,
      questionResults,
    };
  }

  private getActiveSession(sessionId: string, userId: string): StoredSession {
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new NotFoundException('Session not found');
    }

    if (session.isCompleted) {
      throw new BadRequestException('Session is already completed');
    }

    const timeRemaining = this.calculateTimeRemaining(session);
    if (timeRemaining <= 0) {
      session.isCompleted = true;
      session.status = SessionStatus.COMPLETED;
      throw new BadRequestException('Session has expired');
    }

    return session;
  }

  private calculateTimeRemaining(session: StoredSession): number {
    const elapsedSeconds = Math.floor(
      (Date.now() - session.startedAt.getTime()) / 1000,
    );
    return Math.max(0, session.totalTimeSeconds - elapsedSeconds);
  }

  private generateMockQuestions(
    courseId: string,
    difficulty: Difficulty,
    count: number,
  ): StoredQuestion[] {
    const questions: StoredQuestion[] = [];
    const questionTemplates: Record<
      string,
      { question: string; options: string[]; answer: string }[]
    > = {
      default: [
        {
          question: 'What is the capital of France?',
          options: ['London', 'Berlin', 'Paris', 'Madrid'],
          answer: 'C',
        },
        {
          question: 'Which planet is closest to the sun?',
          options: ['Venus', 'Earth', 'Mercury', 'Mars'],
          answer: 'C',
        },
        {
          question: 'What is H2O commonly known as?',
          options: ['Salt', 'Sugar', 'Water', 'Oxygen'],
          answer: 'C',
        },
        {
          question: 'Who wrote Romeo and Juliet?',
          options: ['Dickens', 'Shakespeare', 'Austen', 'Hemingway'],
          answer: 'B',
        },
        {
          question: 'What is the largest mammal?',
          options: ['Elephant', 'Giraffe', 'Blue Whale', 'Shark'],
          answer: 'C',
        },
        {
          question: 'How many continents are there?',
          options: ['5', '6', '7', '8'],
          answer: 'C',
        },
        {
          question: 'What is the chemical symbol for gold?',
          options: ['Go', 'Gd', 'Au', 'Ag'],
          answer: 'C',
        },
        {
          question: 'Which gas do plants absorb?',
          options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
          answer: 'C',
        },
        {
          question: 'What is the speed of light?',
          options: [
            '300,000 km/s',
            '150,000 km/s',
            '500,000 km/s',
            '100,000 km/s',
          ],
          answer: 'A',
        },
        {
          question: 'How many sides does a hexagon have?',
          options: ['5', '6', '7', '8'],
          answer: 'B',
        },
      ],
    };

    const templates = questionTemplates[courseId] || questionTemplates.default;
    const keys = ['A', 'B', 'C', 'D'];

    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length];
      questions.push({
        id: `q_${courseId}_${difficulty}_${i + 1}`,
        questionText: template.question,
        options: keys.map((key, idx) => ({ key, text: template.options[idx] })),
        correctAnswer: template.answer,
        explanation: `The correct answer is ${template.answer}. ${template.question}`,
      });
    }

    return questions;
  }
}

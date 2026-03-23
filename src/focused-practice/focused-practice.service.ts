import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Difficulty, SessionStatus } from '../common/enums/practice.enum';
import { PracticeSession } from '../practice/entities/practice-session.entity';
import { Question } from '../questions/entities/question.entity';
import { Course } from '../courses/entities/course.entity';
import { StartPracticeDto, QuestionCount } from './dto/start-practice.dto';
import {
  PracticeSessionResponseDto,
  CoursesListDto,
  DifficultyOptionDto,
} from './dto/practice-response.dto';
import {
  TestQuestionDto,
  TestSessionStatusDto,
  TestResultDto,
  QuestionResultDto,
} from './dto/test-session.dto';

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

interface StoredQuestion {
  id: string;
  questionText: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

@Injectable()
export class FocusedPracticeService {
  private readonly mockCourses: CoursesListDto[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Introduction to Mathematics',
      slug: 'introduction-to-mathematics',
      description: 'Basic math concepts and calculations',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      title: 'Advanced Physics',
      slug: 'advanced-physics',
      description: 'Mechanics, thermodynamics, and electromagnetism',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      title: 'Organic Chemistry',
      slug: 'organic-chemistry',
      description: 'Carbon compounds and reactions',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      title: 'Biology Fundamentals',
      slug: 'biology-fundamentals',
      description: 'Cell biology and genetics basics',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      title: 'English Grammar',
      slug: 'english-grammar',
      description: 'Grammar rules and sentence structure',
    },
  ];

  private readonly difficulties: DifficultyOptionDto[] = [
    { value: Difficulty.EASY, label: 'Easy' },
    { value: Difficulty.MEDIUM, label: 'Medium' },
    { value: Difficulty.HARD, label: 'Hard' },
  ];

  private readonly activeSessions: Map<string, StoredSession> = new Map();

  constructor(
    @InjectRepository(PracticeSession)
    private readonly practiceSessionRepository: Repository<PracticeSession>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  getCourses(): CoursesListDto[] {
    return this.mockCourses;
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
  ): Promise<PracticeSessionResponseDto> {
    const course = this.mockCourses.find((c) => c.id === dto.courseId);

    const questions = await this.questionRepository.find({
      where: {
        courseId: dto.courseId,
        difficulty: dto.difficulty,
      },
      take: dto.questionCount,
      order: { createdAt: 'DESC' },
    });

    const storedQuestions: StoredQuestion[] =
      questions.length > 0
        ? questions.map((q) => ({
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

    const sessionId = `sess_${Date.now()}_${userId.slice(0, 8)}`;
    const totalTimeSeconds = dto.questionCount * 30;

    const session: StoredSession = {
      id: sessionId,
      userId,
      courseId: dto.courseId,
      courseTitle: course?.title || 'Unknown Course',
      difficulty: dto.difficulty,
      questions: storedQuestions,
      answers: new Map(),
      currentQuestionIndex: 0,
      startedAt: new Date(),
      totalTimeSeconds,
      isCompleted: false,
      status: SessionStatus.IN_PROGRESS,
    };

    this.activeSessions.set(sessionId, session);

    const responseQuestions = storedQuestions.map((q, i) => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options,
    }));

    return {
      sessionId,
      courseTitle: course?.title || 'Unknown Course',
      difficulty: dto.difficulty,
      questionCount: dto.questionCount,
      questions: responseQuestions,
      startedAt: session.startedAt.toISOString(),
      timeLimitMinutes: null,
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

  submitAnswer(
    sessionId: string,
    userId: string,
    answer: string,
  ): TestQuestionDto {
    const session = this.getActiveSession(sessionId, userId);

    if (session.isCompleted) {
      throw new BadRequestException('Session is already completed');
    }

    if (!['A', 'B', 'C', 'D'].includes(answer)) {
      throw new BadRequestException('Invalid answer. Must be A, B, C, or D');
    }

    session.answers.set(session.currentQuestionIndex, answer);

    return this.getCurrentQuestion(sessionId, userId);
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

  completeSession(sessionId: string, userId: string): TestResultDto {
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
      '550e8400-e29b-41d4-a716-446655440001': [
        {
          question: 'What is 2 + 2?',
          options: ['3', '4', '5', '6'],
          answer: 'B',
        },
        {
          question: 'What is 10 / 2?',
          options: ['3', '4', '5', '6'],
          answer: 'C',
        },
        {
          question: 'What is 7 x 8?',
          options: ['54', '56', '58', '60'],
          answer: 'B',
        },
        {
          question: 'What is the square root of 144?',
          options: ['10', '11', '12', '13'],
          answer: 'C',
        },
        {
          question: 'What is 25% of 80?',
          options: ['15', '20', '25', '30'],
          answer: 'B',
        },
        {
          question: 'What is 15 + 27?',
          options: ['40', '41', '42', '43'],
          answer: 'C',
        },
        {
          question: 'What is 100 - 37?',
          options: ['61', '62', '63', '64'],
          answer: 'C',
        },
        {
          question: 'What is 6²?',
          options: ['30', '36', '42', '48'],
          answer: 'B',
        },
        {
          question: 'What is 1/4 as a decimal?',
          options: ['0.14', '0.25', '0.4', '0.5'],
          answer: 'B',
        },
        {
          question: 'What is the next prime after 7?',
          options: ['8', '9', '10', '11'],
          answer: 'D',
        },
      ],
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

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../questions/entities/question.entity';
import { Course } from '../courses/entities/course.entity';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/question.dto';

export interface QuestionListQuery {
  page: number;
  limit: number;
  courseId?: string;
  difficulty?: string;
  topic?: string;
  search?: string;
  isFlagged?: boolean;
}

@Injectable()
export class AdminQuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async getQuestions(query: QuestionListQuery) {
    const { page, limit, courseId, difficulty, topic, search, isFlagged } =
      query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.course', 'course')
      .select([
        'question.id',
        'question.questionText',
        'question.difficulty',
        'question.topic',
        'question.isFlagged',
        'question.flagReason',
        'question.questionType',
        'question.createdAt',
        'course.id',
        'course.title',
      ]);

    if (courseId) {
      queryBuilder.andWhere('question.courseId = :courseId', { courseId });
    }

    if (difficulty) {
      queryBuilder.andWhere('question.difficulty = :difficulty', {
        difficulty,
      });
    }

    if (topic) {
      queryBuilder.andWhere('LOWER(question.topic) LIKE LOWER(:topic)', {
        topic: `%${topic}%`,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        'LOWER(question.questionText) LIKE LOWER(:search)',
        { search: `%${search}%` },
      );
    }

    if (isFlagged !== undefined) {
      queryBuilder.andWhere('question.isFlagged = :isFlagged', { isFlagged });
    }

    const [questions, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('question.createdAt', 'DESC')
      .getManyAndCount();

    const data = questions.map((q) => ({
      id: q.id,
      questionText:
        q.questionText.length > 100
          ? q.questionText.substring(0, 100) + '...'
          : q.questionText,
      fullQuestionText: q.questionText,
      course: q.course ? { id: q.course.id, title: q.course.title } : null,
      difficulty: q.difficulty,
      topic: q.topic,
      isFlagged: q.isFlagged,
      flagReason: q.flagReason,
      questionType: q.questionType,
      createdAt: q.createdAt,
    }));

    return {
      status: true,
      data,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getQuestionById(id: string) {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return {
      status: true,
      data: {
        id: question.id,
        questionText: question.questionText,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: question.difficulty,
        topic: question.topic,
        courseId: question.courseId,
        course: question.course
          ? { id: question.course.id, title: question.course.title }
          : null,
        questionType: question.questionType,
        isFlagged: question.isFlagged,
        flagReason: question.flagReason,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      },
    };
  }

  async createQuestion(dto: CreateQuestionDto, createdBy: string) {
    const course = dto.courseId
      ? await this.courseRepository.findOne({ where: { id: dto.courseId } })
      : null;

    const questionData = this.questionRepository.create({
      courseId: dto.courseId ?? null,
      questionText: dto.questionText,
      questionType: (dto.questionType || 'single_choice') as any,
      options: dto.options,
      correctAnswer: dto.correctAnswer,
      explanation: dto.explanation,
      difficulty: dto.difficulty as any,
      topic: dto.topic,
      createdBy,
      isFlagged: false,
    } as any) as unknown as Question;

    await this.questionRepository.save(questionData);

    return {
      status: true,
      data: {
        id: questionData.id,
        questionText: questionData.questionText,
        course: course ? { id: course.id, title: course.title } : null,
        difficulty: questionData.difficulty,
        topic: questionData.topic,
        createdAt: questionData.createdAt,
      },
    };
  }

  async updateQuestion(id: string, dto: UpdateQuestionDto) {
    const question = await this.questionRepository.findOne({ where: { id } });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (dto.courseId !== undefined) question.courseId = dto.courseId;
    if (dto.questionText !== undefined)
      question.questionText = dto.questionText;
    if (dto.options !== undefined) question.options = dto.options;
    if (dto.correctAnswer !== undefined)
      question.correctAnswer = dto.correctAnswer;
    if (dto.explanation !== undefined) question.explanation = dto.explanation;
    if (dto.difficulty !== undefined)
      question.difficulty = dto.difficulty as any;
    if (dto.topic !== undefined) question.topic = dto.topic;
    if (dto.questionType !== undefined)
      question.questionType = dto.questionType as any;

    await this.questionRepository.save(question);

    const course = question.courseId
      ? await this.courseRepository.findOne({
          where: { id: question.courseId },
        })
      : null;

    return {
      status: true,
      data: {
        id: question.id,
        questionText: question.questionText,
        course: course ? { id: course.id, title: course.title } : null,
        difficulty: question.difficulty,
        topic: question.topic,
        updatedAt: question.updatedAt,
      },
    };
  }

  async deleteQuestion(id: string) {
    const question = await this.questionRepository.findOne({ where: { id } });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    await this.questionRepository.remove(question);

    return { status: true, data: null };
  }

  async flagQuestion(id: string, reason: string) {
    const question = await this.questionRepository.findOne({ where: { id } });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    question.isFlagged = true;
    question.flagReason = reason;

    await this.questionRepository.save(question);

    return {
      status: true,
      data: {
        id: question.id,
        isFlagged: true,
        flagReason: reason,
      },
    };
  }

  async unflagQuestion(id: string) {
    const question = await this.questionRepository.findOne({ where: { id } });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    question.isFlagged = false;
    question.flagReason = null;

    await this.questionRepository.save(question);

    return {
      status: true,
      data: {
        id: question.id,
        isFlagged: false,
      },
    };
  }

  async getFlaggedQuestions(page = 1, limit = 20) {
    return this.getQuestions({ page, limit, isFlagged: true });
  }

  async getCourses() {
    const courses = await this.courseRepository.find({
      where: { isActive: true },
      select: ['id', 'title', 'category'],
      order: { title: 'ASC' },
    });

    return {
      status: true,
      data: courses,
    };
  }
}

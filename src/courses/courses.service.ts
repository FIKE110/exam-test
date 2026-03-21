import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, CourseCategory } from './entities/course.entity';
import { UserCourseProgress } from './entities/user-course-progress.entity';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(UserCourseProgress)
    private progressRepository: Repository<UserCourseProgress>,
  ) {}

  async findAll(options: {
    page: number;
    limit: number;
    category?: CourseCategory;
    difficulty?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    userId?: string;
  }) {
    const {
      page,
      limit,
      category,
      difficulty,
      search,
      sortBy,
      sortOrder = 'DESC',
      userId,
    } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .where('course.is_active = :isActive', { isActive: true });

    if (category) {
      queryBuilder.andWhere('course.category = :category', { category });
    }

    if (difficulty) {
      queryBuilder.andWhere('course.difficulty_level = :difficulty', {
        difficulty,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(course.title ILIKE :search OR course.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const validSortFields = ['name', 'created_at', 'title'];
    const sortField = validSortFields.includes(sortBy || '')
      ? `course.${sortBy}`
      : 'course.created_at';

    const [courses, total] = await queryBuilder
      .orderBy(sortField, sortOrder)
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // If userId provided, get enrollment status for each course
    let enrollments = new Map<string, UserCourseProgress>();
    if (userId) {
      const userEnrollments = await this.progressRepository.find({
        where: { userId },
      });
      enrollments = new Map(userEnrollments.map((e) => [e.courseId, e]));
    }

    return {
      data: courses.map((course) => {
        const enrollment = enrollments.get(course.id);
        return {
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          category: course.category,
          difficultyLevel: course.difficultyLevel,
          totalDurationMinutes: course.totalDurationMinutes,
          totalQuestions: course.totalQuestions,
          thumbnailUrl: course.thumbnailUrl,
          isEnrolled: !!enrollment,
          progressPercentage: enrollment?.progressPercentage || 0,
        };
      }),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string, userId?: string) {
    const course = await this.courseRepository.findOne({
      where: { slug, isActive: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    let enrollment: UserCourseProgress | null = null;
    if (userId) {
      enrollment = await this.progressRepository.findOne({
        where: { userId, courseId: course.id },
      });
    }

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      category: course.category,
      difficultyLevel: course.difficultyLevel,
      totalDurationMinutes: course.totalDurationMinutes,
      totalQuestions: course.totalQuestions,
      thumbnailUrl: course.thumbnailUrl,
      isEnrolled: !!enrollment,
      progress: enrollment
        ? {
            percentage: enrollment.progressPercentage,
            timeSpentMinutes: enrollment.timeSpentMinutes,
            lastAccessedAt: enrollment.lastAccessedAt,
            completedAt: enrollment.completedAt,
          }
        : null,
    };
  }

  async enroll(userId: string, courseId: string) {
    // Check if course exists
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if already enrolled
    const existingEnrollment = await this.progressRepository.findOne({
      where: { userId, courseId },
    });

    if (existingEnrollment) {
      throw new ConflictException('Already enrolled in this course');
    }

    // Create enrollment
    const progress = this.progressRepository.create({
      userId,
      courseId,
      progressPercentage: 0,
      timeSpentMinutes: 0,
      lastAccessedAt: new Date(),
    });

    await this.progressRepository.save(progress);

    return {
      success: true,
      enrollment: {
        userId,
        courseId,
        enrolledAt: progress.createdAt,
      },
    };
  }

  async updateProgress(
    userId: string,
    courseId: string,
    progressData: {
      progressPercentage?: number;
      timeSpentMinutes?: number;
      currentQuestionId?: string;
    },
  ) {
    const progress = await this.progressRepository.findOne({
      where: { userId, courseId },
    });

    if (!progress) {
      throw new NotFoundException('Enrollment not found');
    }

    if (progressData.progressPercentage !== undefined) {
      progress.progressPercentage = progressData.progressPercentage;
      if (progressData.progressPercentage >= 100) {
        progress.completedAt = new Date();
      }
    }

    if (progressData.timeSpentMinutes) {
      progress.timeSpentMinutes += progressData.timeSpentMinutes;
    }

    if (progressData.currentQuestionId) {
      progress.currentQuestionId = progressData.currentQuestionId;
    }

    progress.lastAccessedAt = new Date();

    await this.progressRepository.save(progress);

    return {
      success: true,
      progress: {
        percentage: progress.progressPercentage,
        timeSpentMinutes: progress.timeSpentMinutes,
        completedAt: progress.completedAt,
      },
    };
  }

  async getContinueLearning(userId: string) {
    const progress = await this.progressRepository.findOne({
      where: { userId },
      order: { lastAccessedAt: 'DESC' },
      relations: ['course'],
    });

    if (!progress || !progress.course) {
      return null;
    }

    const remainingMinutes = Math.max(
      0,
      progress.course.totalDurationMinutes - progress.timeSpentMinutes,
    );

    return {
      courseId: progress.course.id,
      courseTitle: progress.course.title,
      progressPercentage: progress.progressPercentage,
      timeRemainingMinutes: remainingMinutes,
      lastAccessedAt: progress.lastAccessedAt,
    };
  }

  // Admin methods
  async create(createCourseDto: CreateCourseDto) {
    const slug = createCourseDto.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existingCourse = await this.courseRepository.findOne({
      where: { slug },
    });

    if (existingCourse) {
      throw new ConflictException('Course with similar title already exists');
    }

    const course = this.courseRepository.create({
      ...createCourseDto,
      slug,
    });

    await this.courseRepository.save(course);

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    const course = await this.courseRepository.findOne({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    Object.assign(course, updateCourseDto);
    await this.courseRepository.save(course);

    return course;
  }

  async delete(id: string) {
    const course = await this.courseRepository.findOne({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    course.isActive = false;
    await this.courseRepository.save(course);

    return { success: true };
  }
}

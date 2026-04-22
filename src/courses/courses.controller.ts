import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  UpdateProgressDto,
} from './dto/course.dto';
import { CourseCategory } from './entities/course.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UploadService, FileCategory } from '../upload/services/upload.service';

class CourseResponseDto {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: CourseCategory;
  difficultyLevel: string;
  totalDurationHours: number;
  thumbnail?: string;
  instructor?: string;
  isEnrolled?: boolean;
  progressPercentage?: number;
  createdAt: Date;
  updatedAt: Date;
}

class EnrollResponseDto {
  status: boolean;
  data: {
    courseId: string;
    courseTitle: string;
    enrolledAt: string;
    message: string;
  };
  meta?: {
    timestamp: string;
    request_id: string;
  };
}

class UpdateProgressResponseDto {
  status: boolean;
  data: {
    courseId: string;
    progressPercentage: number;
    timeSpentMinutes: number;
    lastAccessedAt: string;
  };
  meta?: {
    timestamp: string;
    request_id: string;
  };
}

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(
    private coursesService: CoursesService,
    private uploadService: UploadService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all courses',
    description:
      'Retrieves a paginated list of courses with optional filtering by category, difficulty, and search term. If the user is authenticated, enrolled courses will include progress information.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: CourseCategory,
    example: CourseCategory.MEDICAL,
    description: 'Filter by course category',
  })
  @ApiQuery({
    name: 'difficulty',
    required: false,
    example: 'medium',
    description:
      'Filter by difficulty level (beginner, intermediate, advanced)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    example: 'PLAB',
    description: 'Search in course title and description',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    example: 'title',
    description: 'Sort field: title, created_at, difficulty_level',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    example: 'ASC',
    description: 'Sort order: ASC or DESC',
  })
  @ApiResponse({
    status: 200,
    description: 'Courses retrieved successfully',
    content: {
      'application/json': {
        example: {
          status: true,
          data: [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              title: 'PLAB 1 Preparation',
              slug: 'plab-1-preparation',
              description:
                'Comprehensive preparation for PLAB Part 1 examination',
              category: 'MEDICAL',
              difficultyLevel: 'intermediate',
              totalDurationHours: 40,
              thumbnail: 'https://example.com/courses/plab-1.jpg',
              instructor: 'Dr. Sarah Johnson',
              isEnrolled: false,
              createdAt: '2026-01-15T10:00:00.000Z',
              updatedAt: '2026-03-01T14:30:00.000Z',
            },
          ],
          meta: {
            page: 1,
            limit: 20,
            total: 45,
            total_pages: 3,
            timestamp: '2026-03-21T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440002',
          },
        },
      },
    },
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('category') category?: CourseCategory,
    @Query('difficulty') difficulty?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @CurrentUser('userId') userId?: string,
  ) {
    return this.coursesService.findAll({
      page,
      limit,
      category,
      difficulty,
      search,
      sortBy,
      sortOrder,
      userId,
    });
  }

  @Get(':slug')
  @Public()
  @ApiOperation({
    summary: 'Get course by slug',
    description:
      'Retrieves detailed information about a specific course using its URL-friendly slug. If authenticated and enrolled, includes progress data.',
  })
  @ApiParam({
    name: 'slug',
    description: 'URL-friendly course identifier',
    example: 'plab-1-preparation',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Course retrieved successfully',
    content: {
      'application/json': {
        example: {
          status: true,
          data: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            title: 'PLAB 1 Preparation',
            slug: 'plab-1-preparation',
            description:
              'Comprehensive preparation for PLAB Part 1 examination. This course covers all essential topics including ethics, medicine, surgery, and more.',
            category: 'MEDICAL',
            difficultyLevel: 'intermediate',
            totalDurationHours: 40,
            thumbnail: 'https://example.com/courses/plab-1.jpg',
            instructor: 'Dr. Sarah Johnson',
            isEnrolled: false,
            progressPercentage: 0,
            createdAt: '2026-01-15T10:00:00.000Z',
            updatedAt: '2026-03-01T14:30:00.000Z',
          },
          meta: {
            timestamp: '2026-03-21T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440003',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found - No course exists with the provided slug',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Course not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async findBySlug(
    @Param('slug') slug: string,
    @CurrentUser('userId') userId?: string,
  ) {
    return this.coursesService.findBySlug(slug, userId);
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Enroll in a course',
    description:
      'Enrolls the authenticated user in the specified course. Users can only enroll once per course. Creates initial progress record with 0% completion.',
  })
  @ApiParam({
    name: 'id',
    description: 'Course UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully enrolled in course',
    type: EnrollResponseDto,
    content: {
      'application/json': {
        example: {
          status: true,
          data: {
            courseId: '550e8400-e29b-41d4-a716-446655440001',
            courseTitle: 'PLAB 1 Preparation',
            enrolledAt: '2026-03-21T10:30:00.000Z',
            message:
              'You have successfully enrolled in this course. Start learning now!',
          },
          meta: {
            timestamp: '2026-03-21T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440004',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description:
      'Course not found - Course with the specified ID does not exist',
  })
  @ApiResponse({
    status: 409,
    description: 'Already enrolled - User is already enrolled in this course',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Already enrolled in this course' },
        error: { type: 'string', example: 'Conflict' },
      },
    },
  })
  async enroll(
    @CurrentUser('userId') userId: string,
    @Param('id') courseId: string,
  ) {
    return this.coursesService.enroll(userId, courseId);
  }

  @Put(':id/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update course progress',
    description:
      'Updates the progress for an enrolled course. Can update progress percentage, time spent, or mark course as completed.',
  })
  @ApiParam({
    name: 'id',
    description: 'Course UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    description: 'Progress update data',
    schema: {
      type: 'object',
      properties: {
        progressPercentage: {
          type: 'number',
          description: 'Progress percentage (0-100)',
          example: 45,
          minimum: 0,
          maximum: 100,
        },
        timeSpentMinutes: {
          type: 'number',
          description: 'Additional time spent on course in minutes',
          example: 30,
          minimum: 0,
        },
        completedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Optional completion timestamp',
          example: '2026-03-21T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Progress updated successfully',
    type: UpdateProgressResponseDto,
    content: {
      'application/json': {
        example: {
          status: true,
          data: {
            courseId: '550e8400-e29b-41d4-a716-446655440001',
            progressPercentage: 45,
            timeSpentMinutes: 720,
            lastAccessedAt: '2026-03-21T10:30:00.000Z',
          },
          meta: {
            timestamp: '2026-03-21T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440005',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - Invalid progress data',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['progressPercentage must be between 0 and 100'],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description:
      'Course enrollment not found - User is not enrolled in this course',
  })
  async updateProgress(
    @CurrentUser('userId') userId: string,
    @Param('id') courseId: string,
    @Body() progressData: UpdateProgressDto,
  ) {
    return this.coursesService.updateProgress(userId, courseId, progressData);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new course (Admin only)',
    description:
      'Creates a new course in the system. The course slug is automatically generated from the title. Requires admin privileges.',
  })
  @ApiBody({
    description: 'Course creation data',
    schema: {
      type: 'object',
      required: ['title', 'description', 'category', 'difficultyLevel'],
      properties: {
        title: {
          type: 'string',
          example: 'PLAB 1 Preparation',
          description: 'Course title',
          maxLength: 255,
        },
        description: {
          type: 'string',
          example: 'Comprehensive preparation for PLAB Part 1 examination',
          description: 'Course description',
        },
        category: {
          type: 'string',
          enum: ['MEDICAL', 'NURSING', 'ALLIED_HEALTH', 'OTHER'],
          example: 'MEDICAL',
          description: 'Course category',
        },
        difficultyLevel: {
          type: 'string',
          enum: ['beginner', 'intermediate', 'advanced'],
          example: 'intermediate',
          description: 'Difficulty level',
        },
        totalDurationHours: {
          type: 'number',
          example: 40,
          description: 'Total course duration in hours',
        },
        thumbnail: {
          type: 'string',
          format: 'uri',
          example: 'https://example.com/courses/plab-1.jpg',
          description: 'Course thumbnail URL (optional)',
        },
        instructor: {
          type: 'string',
          example: 'Dr. Sarah Johnson',
          description: 'Instructor name (optional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
    type: CourseResponseDto,
    content: {
      'application/json': {
        example: {
          status: true,
          data: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            title: 'PLAB 1 Preparation',
            slug: 'plab-1-preparation',
            description:
              'Comprehensive preparation for PLAB Part 1 examination',
            category: 'MEDICAL',
            difficultyLevel: 'intermediate',
            totalDurationHours: 40,
            thumbnail: 'https://example.com/courses/plab-1.jpg',
            instructor: 'Dr. Sarah Johnson',
            createdAt: '2026-03-21T10:30:00.000Z',
            updatedAt: '2026-03-21T10:30:00.000Z',
          },
          meta: {
            timestamp: '2026-03-21T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440006',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - Invalid course data',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Admin access required - User does not have admin privileges',
  })
  async create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload course thumbnail image (Admin only)',
    description:
      'Uploads a thumbnail image for a course. Accepts image files only (jpg, png, gif, webp). Max file size: 5MB. The image is stored on Cloudinary (or local filesystem as fallback) and the course thumbnail URL is updated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Course UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    description: 'Image file to upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (max 5MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded and course thumbnail updated successfully',
    content: {
      'application/json': {
        example: {
          status: true,
          data: {
            courseId: '550e8400-e29b-41d4-a716-446655440001',
            thumbnailUrl:
              'https://res.cloudinary.com/demo/image/upload/v1234567890/course-images/abc123.jpg',
          },
          error: null,
          meta: {
            timestamp: '2026-03-21T10:30:00.000Z',
            request_id: 'uuid',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - Invalid file type or no file provided',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const { url } = await this.uploadService.uploadFile(
      file,
      FileCategory.COURSE_IMAGE,
    );

    return this.coursesService.updateThumbnail(id, url);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a course (Admin only)',
    description:
      'Updates an existing course. Only provided fields will be updated. Requires admin privileges.',
  })
  @ApiParam({
    name: 'id',
    description: 'Course UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    description: 'Course update data (all fields optional)',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'Updated Course Title',
          description: 'New course title',
          maxLength: 255,
        },
        description: {
          type: 'string',
          example: 'Updated course description',
          description: 'New course description',
        },
        difficultyLevel: {
          type: 'string',
          enum: ['beginner', 'intermediate', 'advanced'],
          example: 'advanced',
          description: 'New difficulty level',
        },
        thumbnail: {
          type: 'string',
          format: 'uri',
          description: 'New thumbnail URL',
        },
        instructor: {
          type: 'string',
          example: 'Dr. Updated Name',
          description: 'New instructor name',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Course updated successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - Invalid course data',
  })
  @ApiResponse({
    status: 403,
    description: 'Admin access required - User does not have admin privileges',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found - No course exists with the specified ID',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a course (Admin only)',
    description:
      'Permanently deletes a course and all associated enrollment records. This action cannot be undone. Requires admin privileges.',
  })
  @ApiParam({
    name: 'id',
    description: 'Course UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Course deleted successfully - No content returned',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Admin access required - User does not have admin privileges',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found - No course exists with the specified ID',
  })
  async delete(@Param('id') id: string) {
    await this.coursesService.delete(id);
    return null;
  }
}

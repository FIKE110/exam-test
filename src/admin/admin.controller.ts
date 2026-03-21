import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { AdminUsersService } from './admin-users.service';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminQuestionsService } from './admin-questions.service';
import { AdminSettingsService } from './admin-settings.service';
import {
  AdminLoginDto,
  AdminRegisterDto,
  RefreshTokenDto,
} from './dto/admin-auth.dto';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  FlagQuestionDto,
} from './dto/question.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private adminAuthService: AdminAuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new admin' })
  @ApiBody({
    description: 'Admin registration data',
    schema: {
      type: 'object',
      required: ['email', 'password', 'name'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'admin@examprep.com',
          description: 'Admin email address',
        },
        password: {
          type: 'string',
          minLength: 8,
          example: 'AdminPassword123!',
          description: 'Admin password (min 8 characters)',
        },
        name: {
          type: 'string',
          example: 'Admin User',
          description: 'Admin full name',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Admin successfully registered',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '550e8400-e29b-41d4-a716-446655440001',
                },
                email: { type: 'string', example: 'admin@examprep.com' },
                name: { type: 'string', example: 'Admin User' },
                role: { type: 'string', example: 'admin' },
                createdAt: { type: 'string', example: '2026-03-22T10:00:00Z' },
              },
            },
            tokens: {
              type: 'object',
              properties: {
                access_token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
                refresh_token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - Invalid input data',
  })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  async register(@Body() registerDto: AdminRegisterDto) {
    return this.adminAuthService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({ summary: 'Admin login with email and password' })
  @ApiBody({
    description: 'Admin login credentials',
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'admin@examprep.com',
          description: 'Admin email address',
        },
        password: {
          type: 'string',
          example: 'AdminPassword123!',
          description: 'Admin password',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '550e8400-e29b-41d4-a716-446655440001',
                },
                email: { type: 'string', example: 'admin@examprep.com' },
                name: { type: 'string', example: 'Admin User' },
                role: { type: 'string', example: 'admin' },
              },
            },
            tokens: {
              type: 'object',
              properties: {
                access_token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
                refresh_token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: AdminLoginDto) {
    return this.adminAuthService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({ summary: 'Refresh admin access token' })
  @ApiBody({
    description: 'Refresh token',
    schema: {
      type: 'object',
      required: ['refresh_token'],
      properties: {
        refresh_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          description: 'Valid refresh token',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        tokens: {
          type: 'object',
          properties: {
            access_token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            refresh_token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body('refresh_token') refreshToken: string) {
    const tokens = await this.adminAuthService.refreshTokens(refreshToken);
    return { tokens };
  }
}

@ApiTags('Admin Dashboard')
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminDashboardController {
  constructor(private adminDashboardService: AdminDashboardService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get admin dashboard metrics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard metrics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            totalQuestions: { type: 'number', example: 28400 },
            registeredUsers: { type: 'number', example: 400 },
            premiumUsers: { type: 'number', example: 98 },
            averageScore: { type: 'number', example: 69 },
            totalPracticeSessions: { type: 'number', example: 1250 },
            totalDiscussions: { type: 'number', example: 340 },
            totalAnswers: { type: 'number', example: 890 },
            activeCourses: { type: 'number', example: 12 },
            weeklyNewUsers: { type: 'number', example: 25 },
            weeklyNewQuestions: { type: 'number', example: 150 },
            topSubjects: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Cardiology' },
                  accuracy: { type: 'number', example: 72 },
                  questionsAnswered: { type: 'number', example: 2500 },
                },
              },
            },
            recentActivity: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['discussion', 'practice'],
                    example: 'discussion',
                  },
                  description: {
                    type: 'string',
                    example: 'New discussion: "How to prepare for..."',
                  },
                  timestamp: {
                    type: 'string',
                    example: '2026-03-22T10:00:00Z',
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getMetrics() {
    const metrics = await this.adminDashboardService.getMetrics();
    return { status: true, data: metrics };
  }

  @Get('weekly-stats')
  @ApiOperation({ summary: 'Get weekly statistics' })
  @ApiResponse({
    status: 200,
    description: 'Weekly stats retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            weeklyPracticeSessions: { type: 'number', example: 150 },
            weeklyQuestionsAdded: { type: 'number', example: 25 },
            sessionsByDay: {
              type: 'object',
              additionalProperties: { type: 'number' },
              example: {
                '2026-03-17': 25,
                '2026-03-18': 30,
                '2026-03-19': 28,
                '2026-03-20': 35,
                '2026-03-21': 20,
                '2026-03-22': 12,
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getWeeklyStats() {
    const stats = await this.adminDashboardService.getWeeklyStats();
    return { status: true, data: stats };
  }
}

@ApiTags('Admin Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminUsersController {
  constructor(private adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of all users' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'john',
    description: 'Search by name or email',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'suspended'],
    description: 'Filter by user status',
  })
  @ApiResponse({
    status: 200,
    description: 'Users list retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: '550e8400-e29b-41d4-a716-446655440001',
              },
              email: { type: 'string', example: 'user@example.com' },
              name: { type: 'string', example: 'John Doe' },
              avatarUrl: { type: 'string', nullable: true, example: null },
              role: { type: 'string', example: 'user' },
              subscriptionTier: {
                type: 'string',
                enum: ['free', 'premium'],
                example: 'free',
              },
              isActive: { type: 'boolean', example: true },
              createdAt: { type: 'string', example: '2026-03-01T10:00:00Z' },
              updatedAt: { type: 'string', example: '2026-03-15T14:30:00Z' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 20 },
                total: { type: 'number', example: 400 },
                totalPages: { type: 'number', example: 20 },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: 'active' | 'suspended',
  ) {
    return this.adminUsersService.getUsers({ page, limit, search, status });
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update user status (Active/Suspended)' })
  @ApiBody({
    description: 'User status update',
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: {
          type: 'string',
          enum: ['active', 'suspended'],
          example: 'suspended',
          description: 'New status for the user',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            isActive: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: 'active' | 'suspended',
  ) {
    return this.adminUsersService.updateUserStatus(id, status);
  }
}

@ApiTags('Admin Questions')
@Controller('admin/questions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminQuestionsController {
  constructor(private adminQuestionsService: AdminQuestionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all questions (admin)' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    type: String,
    description: 'Filter by course UUID',
  })
  @ApiQuery({
    name: 'difficulty',
    required: false,
    type: String,
    enum: ['easy', 'medium', 'hard'],
    description: 'Filter by difficulty',
  })
  @ApiQuery({
    name: 'topic',
    required: false,
    type: String,
    description: 'Filter by topic',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in question text',
  })
  @ApiQuery({
    name: 'isFlagged',
    required: false,
    type: Boolean,
    description: 'Filter flagged questions only',
  })
  @ApiResponse({
    status: 200,
    description: 'Questions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: '550e8400-e29b-41d4-a716-446655440001',
              },
              questionText: {
                type: 'string',
                example: 'What is the primary function of the heart?',
              },
              fullQuestionText: {
                type: 'string',
                example: 'What is the primary function of the heart?',
              },
              course: {
                type: 'object',
                nullable: true,
                properties: {
                  id: {
                    type: 'string',
                    example: '550e8400-e29b-41d4-a716-446655440002',
                  },
                  title: { type: 'string', example: 'PLAB Prep' },
                },
              },
              difficulty: {
                type: 'string',
                enum: ['easy', 'medium', 'hard'],
                example: 'medium',
              },
              topic: { type: 'string', example: 'Cardiology' },
              isFlagged: { type: 'boolean', example: false },
              flagReason: { type: 'string', nullable: true, example: null },
              questionType: { type: 'string', example: 'single_choice' },
              createdAt: { type: 'string', example: '2026-03-21T10:00:00Z' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 20 },
                total: { type: 'number', example: 28400 },
                totalPages: { type: 'number', example: 1420 },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getQuestions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('courseId') courseId?: string,
    @Query('difficulty') difficulty?: string,
    @Query('topic') topic?: string,
    @Query('search') search?: string,
    @Query('isFlagged') isFlagged?: boolean,
  ) {
    return this.adminQuestionsService.getQuestions({
      page,
      limit,
      courseId,
      difficulty,
      topic,
      search,
      isFlagged,
    });
  }

  @Get('flagged')
  @ApiOperation({ summary: 'Get flagged questions' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Flagged questions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: '550e8400-e29b-41d4-a716-446655440001',
              },
              questionText: {
                type: 'string',
                example: 'What is the primary function of the heart?',
              },
              course: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                },
              },
              difficulty: { type: 'string', example: 'medium' },
              topic: { type: 'string', example: 'Cardiology' },
              isFlagged: { type: 'boolean', example: true },
              flagReason: {
                type: 'string',
                example: 'Incorrect answer option',
              },
              questionType: { type: 'string', example: 'single_choice' },
              createdAt: { type: 'string', example: '2026-03-21T10:00:00Z' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 20 },
                total: { type: 'number', example: 15 },
                totalPages: { type: 'number', example: 1 },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getFlaggedQuestions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.adminQuestionsService.getFlaggedQuestions(page, limit);
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get all courses for question creation' })
  @ApiResponse({
    status: 200,
    description: 'Courses retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: '550e8400-e29b-41d4-a716-446655440001',
              },
              title: { type: 'string', example: 'PLAB Prep' },
              category: { type: 'string', example: 'MEDICAL' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getCourses() {
    return this.adminQuestionsService.getCourses();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get question by ID' })
  @ApiResponse({
    status: 200,
    description: 'Question retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            questionText: {
              type: 'string',
              example: 'What is the primary function of the heart?',
            },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'a' },
                  text: { type: 'string', example: 'Pumping blood' },
                },
              },
            },
            correctAnswer: { type: 'string', example: 'a' },
            explanation: {
              type: 'string',
              example:
                "The heart's primary function is to pump blood throughout the body...",
            },
            difficulty: {
              type: 'string',
              enum: ['easy', 'medium', 'hard'],
              example: 'medium',
            },
            topic: { type: 'string', example: 'Cardiology' },
            courseId: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440002',
            },
            course: {
              type: 'object',
              nullable: true,
              properties: {
                id: {
                  type: 'string',
                  example: '550e8400-e29b-41d4-a716-446655440002',
                },
                title: { type: 'string', example: 'PLAB Prep' },
              },
            },
            questionType: { type: 'string', example: 'single_choice' },
            isFlagged: { type: 'boolean', example: false },
            flagReason: { type: 'string', nullable: true, example: null },
            createdAt: { type: 'string', example: '2026-03-21T10:00:00Z' },
            updatedAt: { type: 'string', example: '2026-03-21T10:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async getQuestion(@Param('id') id: string) {
    return this.adminQuestionsService.getQuestionById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new question' })
  @ApiBody({
    description: 'Question creation data',
    schema: {
      type: 'object',
      required: [
        'questionText',
        'options',
        'correctAnswer',
        'difficulty',
        'topic',
      ],
      properties: {
        courseId: {
          type: 'string',
          format: 'uuid',
          example: '550e8400-e29b-41d4-a716-446655440001',
          description: 'Course UUID (optional)',
        },
        questionText: {
          type: 'string',
          example: 'What is the primary function of the heart?',
          description: 'The question text',
        },
        options: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'a' },
              text: { type: 'string', example: 'Pumping blood' },
            },
          },
          example: [
            { id: 'a', text: 'Pumping blood' },
            { id: 'b', text: 'Filtering toxins' },
            { id: 'c', text: 'Producing hormones' },
            { id: 'd', text: 'Storing oxygen' },
          ],
        },
        correctAnswer: {
          type: 'string',
          example: 'a',
          description: 'Correct answer ID',
        },
        explanation: {
          type: 'string',
          example:
            "The heart's primary function is to pump blood throughout the body, delivering oxygen and nutrients to all tissues.",
          description: 'Explanation for the correct answer',
        },
        difficulty: {
          type: 'string',
          enum: ['easy', 'medium', 'hard'],
          example: 'medium',
          description: 'Difficulty level',
        },
        topic: {
          type: 'string',
          example: 'Cardiology',
          description: 'Topic name',
        },
        questionType: {
          type: 'string',
          enum: ['single_choice', 'multiple_choice'],
          default: 'single_choice',
          example: 'single_choice',
          description: 'Question type',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Question created successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            questionText: {
              type: 'string',
              example: 'What is the primary function of the heart?',
            },
            course: {
              type: 'object',
              nullable: true,
              properties: {
                id: {
                  type: 'string',
                  example: '550e8400-e29b-41d4-a716-446655440002',
                },
                title: { type: 'string', example: 'PLAB Prep' },
              },
            },
            difficulty: { type: 'string', example: 'medium' },
            topic: { type: 'string', example: 'Cardiology' },
            createdAt: { type: 'string', example: '2026-03-22T10:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async createQuestion(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.adminQuestionsService.createQuestion(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a question' })
  @ApiBody({
    description: 'Question update data',
    schema: {
      type: 'object',
      properties: {
        courseId: {
          type: 'string',
          format: 'uuid',
          example: '550e8400-e29b-41d4-a716-446655440001',
        },
        questionText: { type: 'string', example: 'Updated question text...' },
        options: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'a' },
              text: { type: 'string', example: 'Updated option' },
            },
          },
        },
        correctAnswer: { type: 'string', example: 'b' },
        explanation: { type: 'string', example: 'Updated explanation...' },
        difficulty: {
          type: 'string',
          enum: ['easy', 'medium', 'hard'],
          example: 'hard',
        },
        topic: { type: 'string', example: 'Updated Topic' },
        questionType: {
          type: 'string',
          enum: ['single_choice', 'multiple_choice'],
          example: 'single_choice',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Question updated successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            questionText: {
              type: 'string',
              example: 'Updated question text...',
            },
            difficulty: { type: 'string', example: 'hard' },
            updatedAt: { type: 'string', example: '2026-03-22T11:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async updateQuestion(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.adminQuestionsService.updateQuestion(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a question' })
  @ApiResponse({ status: 204, description: 'Question deleted successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async deleteQuestion(@Param('id') id: string) {
    return this.adminQuestionsService.deleteQuestion(id);
  }

  @Post(':id/flag')
  @ApiOperation({ summary: 'Flag a question' })
  @ApiBody({
    description: 'Flag reason',
    schema: {
      type: 'object',
      required: ['reason'],
      properties: {
        reason: {
          type: 'string',
          example: 'Incorrect answer option',
          description: 'Reason for flagging the question',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Question flagged successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            isFlagged: { type: 'boolean', example: true },
            flagReason: { type: 'string', example: 'Incorrect answer option' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async flagQuestion(@Param('id') id: string, @Body() dto: FlagQuestionDto) {
    return this.adminQuestionsService.flagQuestion(id, dto.reason);
  }

  @Post(':id/unflag')
  @ApiOperation({ summary: 'Unflag a question' })
  @ApiResponse({
    status: 200,
    description: 'Question unflagged successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            isFlagged: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async unflagQuestion(@Param('id') id: string) {
    return this.adminQuestionsService.unflagQuestion(id);
  }
}

@ApiTags('Admin Settings')
@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminSettingsController {
  constructor(private adminSettingsService: AdminSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get platform settings' })
  @ApiResponse({
    status: 200,
    description: 'Settings retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            platformName: { type: 'string', example: 'ExamPrep' },
            supportEmail: { type: 'string', example: 'support@examprep.com' },
            freePlanQuestions: { type: 'number', example: 50 },
            freePlanTopics: { type: 'number', example: 2 },
            paidPlanPrice: { type: 'number', example: 10 },
            subscriptionBillingCycle: { type: 'string', example: 'monthly' },
            maintenanceMode: { type: 'boolean', example: false },
            maintenanceMessage: {
              type: 'string',
              example: 'We are currently under maintenance.',
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getSettings() {
    const settings = await this.adminSettingsService.getSettings();
    return { status: true, data: settings };
  }

  @Put()
  @ApiOperation({ summary: 'Update platform settings' })
  @ApiBody({
    description: 'Settings to update (all fields optional)',
    schema: {
      type: 'object',
      properties: {
        platform_name: {
          type: 'string',
          example: 'ExamPrep Pro',
          description: 'Platform display name',
        },
        support_email: {
          type: 'string',
          format: 'email',
          example: 'help@examprep.com',
          description: 'Support email address',
        },
        free_plan_questions: {
          type: 'number',
          example: 100,
          description: 'Number of questions for free plan',
        },
        free_plan_topics: {
          type: 'number',
          example: 5,
          description: 'Number of topics for free plan',
        },
        paid_plan_price: {
          type: 'number',
          example: 15,
          description: 'Monthly price for paid plan',
        },
        maintenance_mode: {
          type: 'boolean',
          example: false,
          description: 'Enable/disable maintenance mode',
        },
        maintenance_message: {
          type: 'string',
          example: 'We are currently under scheduled maintenance.',
          description: 'Maintenance mode message',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Settings updated successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            platformName: { type: 'string', example: 'ExamPrep Pro' },
            supportEmail: { type: 'string', example: 'help@examprep.com' },
            freePlanQuestions: { type: 'number', example: 100 },
            freePlanTopics: { type: 'number', example: 5 },
            paidPlanPrice: { type: 'number', example: 15 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async updateSettings(@Body() updates: Record<string, string>) {
    const settings = await this.adminSettingsService.updateSettings(updates);
    return { status: true, data: settings };
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all raw settings' })
  @ApiResponse({
    status: 200,
    description: 'All settings retrieved',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          additionalProperties: { type: 'string' },
          example: {
            platform_name: 'ExamPrep',
            support_email: 'support@examprep.com',
            free_plan_questions: '50',
            free_plan_topics: '2',
            paid_plan_price: '10',
            subscription_billing_cycle: 'monthly',
            maintenance_mode: 'false',
            maintenance_message: 'We are currently under maintenance.',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getAllSettingsRaw() {
    const settings = await this.adminSettingsService.getAllSettingsRaw();
    return { status: true, data: settings };
  }
}

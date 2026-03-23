import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    content: {
      'application/json': {
        example: {
          status: true,
          data: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            email: 'emma.okonkwo@example.com',
            fullName: 'Emma Okonkwo',
            firstName: 'Emma',
            lastName: 'Okonkwo',
            phone: '+2348012345678',
            dateOfBirth: '1995-06-15',
            profession: 'STUDENT',
            avatarUrl: 'https://example.com/avatars/emma.jpg',
            examTypes: ['USMLE', 'PLAB'],
            subscriptionTier: 'free',
            subscriptionStatus: 'active',
            subscriptionExpiresAt: null,
            emailVerified: true,
            createdAt: '2026-01-15T10:30:00.000Z',
            updatedAt: '2026-03-21T14:20:00.000Z',
          },
          error: null,
          meta: {
            timestamp: '2026-03-23T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440002',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
    content: {
      'application/json': {
        example: {
          status: false,
          data: null,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          meta: {
            timestamp: '2026-03-23T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440002',
          },
        },
      },
    },
  })
  async getProfile(@CurrentUser('userId') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user profile',
    description:
      'Update profile fields (name, avatar, phone, date of birth, profession). Email cannot be updated via this endpoint.',
  })
  @ApiBody({
    description:
      'Profile fields to update. All fields are optional. Email cannot be changed.',
    schema: {
      type: 'object',
      properties: {
        fullName: {
          type: 'string',
          example: 'Emma Okonkwo',
          description: 'User full name (2-100 characters)',
          minLength: 2,
          maxLength: 100,
        },
        avatarUrl: {
          type: 'string',
          format: 'uri',
          example: 'https://example.com/avatars/emma.jpg',
          description: 'URL to the user avatar image',
        },
        phone: {
          type: 'string',
          example: '+2348012345678',
          description: 'User phone number (7-20 characters)',
          minLength: 7,
          maxLength: 20,
        },
        dateOfBirth: {
          type: 'string',
          format: 'date',
          example: '1995-06-15',
          description: 'User date of birth (ISO 8601 format YYYY-MM-DD)',
        },
        profession: {
          type: 'string',
          enum: [
            'STUDENT',
            'DOCTOR',
            'NURSE',
            'ENGINEER',
            'TEACHER',
            'ACCOUNTANT',
            'IT_PROFESSIONAL',
            'LAWYER',
            'BUSINESS_PROFESSIONAL',
            'OTHER',
          ],
          example: 'STUDENT',
          description: 'User profession code',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    content: {
      'application/json': {
        example: {
          status: true,
          data: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            email: 'emma.okonkwo@example.com',
            fullName: 'Emma Okonkwo',
            firstName: 'Emma',
            lastName: 'Okonkwo',
            phone: '+2348012345678',
            dateOfBirth: '1995-06-15',
            profession: 'STUDENT',
            avatarUrl: 'https://example.com/avatars/emma.jpg',
            examTypes: ['USMLE', 'PLAB'],
            subscriptionTier: 'free',
            subscriptionStatus: 'active',
            subscriptionExpiresAt: null,
            emailVerified: true,
            createdAt: '2026-01-15T10:30:00.000Z',
            updatedAt: '2026-03-23T10:30:00.000Z',
          },
          error: null,
          meta: {
            timestamp: '2026-03-23T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440002',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    content: {
      'application/json': {
        example: {
          status: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'The request validation failed',
            details: [
              {
                field: 'fullName',
                message: 'Full name must be between 2 and 100 characters',
              },
            ],
          },
          meta: {
            timestamp: '2026-03-23T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440002',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
    content: {
      'application/json': {
        example: {
          status: false,
          data: null,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          meta: {
            timestamp: '2026-03-23T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440002',
          },
        },
      },
    },
  })
  async updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user statistics',
    description:
      'Returns study statistics including questions answered, accuracy, study hours, and streak data.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    content: {
      'application/json': {
        example: {
          status: true,
          data: {
            totalQuestionsAnswered: 1250,
            overallAccuracy: 72.5,
            totalStudyHours: 48,
            currentStreak: 5,
            longestStreak: 14,
          },
          error: null,
          meta: {
            timestamp: '2026-03-23T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440002',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
    content: {
      'application/json': {
        example: {
          status: false,
          data: null,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          meta: {
            timestamp: '2026-03-23T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440002',
          },
        },
      },
    },
  })
  async getStats(@CurrentUser('userId') userId: string) {
    return this.usersService.getUserStats(userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all users (Admin only)',
    description:
      'Returns a paginated list of all users. Supports search by email or name.',
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
    name: 'search',
    required: false,
    type: String,
    example: 'emma',
    description: 'Search by email, first name, or last name',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    content: {
      'application/json': {
        example: {
          status: true,
          data: {
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440001',
                email: 'emma.okonkwo@example.com',
                firstName: 'Emma',
                lastName: 'Okonkwo',
                subscriptionTier: 'free',
                subscriptionStatus: 'active',
                isAdmin: false,
                createdAt: '2026-01-15T10:30:00.000Z',
              },
            ],
            pagination: {
              page: 1,
              limit: 20,
              total: 45,
              total_pages: 3,
            },
          },
          error: null,
          meta: {
            timestamp: '2026-03-23T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440002',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
    content: {
      'application/json': {
        example: {
          status: false,
          data: null,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          meta: {
            timestamp: '2026-03-23T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440002',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Admin access required',
    content: {
      'application/json': {
        example: {
          status: false,
          data: null,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to access this resource',
          },
          meta: {
            timestamp: '2026-03-23T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440002',
          },
        },
      },
    },
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll({ page, limit, search });
  }
}

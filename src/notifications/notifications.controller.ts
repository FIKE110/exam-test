import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationForUserDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class CreateNotificationResponseDto {
  status: boolean;
  data: {
    id: string;
    userId: string;
    title: string;
    message: string;
    tag: string;
    isRead: boolean;
    actionUrl: string | null;
    createdAt: string;
  };
  meta?: {
    timestamp: string;
    request_id: string;
  };
}

class NotificationListItemDto {
  id: string;
  title: string;
  messagePreview: string;
  tag: string;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
}

class GetNotificationsResponseDto {
  status: boolean;
  data: NotificationListItemDto[];
  meta: {
    unreadCount: number;
    total: number;
    timestamp?: string;
    request_id?: string;
  };
}

class MarkReadResponseDto {
  status: boolean;
  data: {
    id: string;
    isRead: boolean;
  };
}

class MarkAllReadResponseDto {
  status: boolean;
  data: {
    updatedCount: number;
  };
}

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Create a new notification (Admin only)',
    description:
      'Send a notification to a specific user. Requires admin privileges.',
  })
  @ApiBody({
    description: 'Notification details',
    schema: {
      type: 'object',
      required: ['userId', 'title', 'message'],
      properties: {
        userId: {
          type: 'string',
          format: 'uuid',
          description: 'UUID of the user to send notification to',
          example: '550e8400-e29b-41d4-a716-446655440001',
        },
        title: {
          type: 'string',
          description: 'Notification title (max 255 characters)',
          example: 'New Course Available',
          maxLength: 255,
        },
        message: {
          type: 'string',
          description: 'Notification message body',
          example:
            'A new PLAB preparation course has been added to our library. Check it out now!',
        },
        tag: {
          type: 'string',
          enum: [
            'admin',
            'system',
            'user',
            'course',
            'exam',
            'progress',
            'subscription',
            'general',
          ],
          description: 'Notification category/tag',
          example: 'course',
          default: 'general',
        },
        actionUrl: {
          type: 'string',
          description: 'Optional URL to redirect when notification is clicked',
          example: '/courses/plab-medical-preparation',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
    type: CreateNotificationResponseDto,
    content: {
      'application/json': {
        example: {
          status: true,
          data: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            userId: '550e8400-e29b-41d4-a716-446655440002',
            title: 'New Course Available',
            message:
              'A new PLAB preparation course has been added to our library.',
            tag: 'course',
            isRead: false,
            actionUrl: '/courses/plab-medical-preparation',
            createdAt: '2026-03-21T10:30:00.000Z',
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
    status: 400,
    description: 'Validation error - Invalid input data',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['title must be a string', 'userId must be a UUID'],
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
    status: 403,
    description: 'Admin access required - User is not an admin',
  })
  async create(@Body() createDto: CreateNotificationForUserDto) {
    const notification = await this.notificationsService.create(
      createDto as any,
    );
    return {
      status: true,
      data: notification,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all notifications for current user',
    description:
      'Returns a list of notifications for the authenticated user. Each notification includes a truncated message preview (first 100 characters of the first line).',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    type: GetNotificationsResponseDto,
    content: {
      'application/json': {
        example: {
          status: true,
          data: [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              title: 'Welcome to ExamPrep!',
              messagePreview:
                'Your account has been successfully created. Start your exam preparation journey today!',
              tag: 'system',
              isRead: false,
              actionUrl: '/dashboard',
              createdAt: '2026-03-21T10:30:00.000Z',
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440002',
              title: 'New Course Available',
              messagePreview:
                'A new PLAB preparation course has been added to our library.',
              tag: 'course',
              isRead: true,
              actionUrl: '/courses/plab-medical-preparation',
              createdAt: '2026-03-20T15:45:00.000Z',
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440003',
              title: 'Subscription Renewed',
              messagePreview:
                'Your premium subscription has been renewed for another year.',
              tag: 'subscription',
              isRead: false,
              actionUrl: null,
              createdAt: '2026-03-19T09:00:00.000Z',
            },
          ],
          meta: {
            unreadCount: 2,
            total: 3,
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
  async findAll(@CurrentUser('userId') userId: string) {
    return this.notificationsService.findAllForUser(userId);
  }

  @Put(':id/read')
  @ApiOperation({
    summary: 'Mark notification as read',
    description:
      'Mark a specific notification as read. The notification must belong to the authenticated user.',
  })
  @ApiBody({
    description: 'Mark as read (optional - defaults to true)',
    schema: {
      type: 'object',
      properties: {
        isRead: {
          type: 'boolean',
          description: 'Mark notification as read',
          default: true,
          example: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
    type: MarkReadResponseDto,
    content: {
      'application/json': {
        example: {
          status: true,
          data: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            isRead: true,
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
      'Notification not found - Notification does not exist or does not belong to user',
  })
  async markAsRead(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    const notification = await this.notificationsService.markAsRead(id, userId);
    return {
      status: true,
      data: {
        id: notification.id,
        isRead: notification.isRead,
      },
    };
  }

  @Put('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description:
      'Mark all unread notifications for the authenticated user as read.',
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
    type: MarkAllReadResponseDto,
    content: {
      'application/json': {
        example: {
          status: true,
          data: {
            updatedCount: 5,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required - Invalid or missing JWT token',
  })
  async markAllAsRead(@CurrentUser('userId') userId: string) {
    const count = await this.notificationsService.markAllAsRead(userId);
    return {
      status: true,
      data: {
        updatedCount: count,
      },
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a notification',
    description:
      'Delete a specific notification. The notification must belong to the authenticated user.',
  })
  @ApiResponse({
    status: 204,
    description: 'Notification deleted successfully - No content returned',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description:
      'Notification not found - Notification does not exist or does not belong to user',
  })
  async delete(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    await this.notificationsService.delete(id, userId);
    return null;
  }
}

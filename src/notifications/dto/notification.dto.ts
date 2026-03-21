import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationTag } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Notification title',
    example: 'Welcome to ExamPrep!',
    required: true,
    type: 'string',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    description: 'Notification message body',
    example:
      'Your account has been successfully created. Start your exam preparation journey today!',
    required: true,
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiProperty({
    description: 'Notification tag/category',
    example: 'system',
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
    required: false,
    default: 'general',
  })
  @IsOptional()
  @IsEnum(NotificationTag)
  tag?: NotificationTag;

  @ApiPropertyOptional({
    description: 'Optional URL to redirect when notification is clicked',
    example: '/courses/plab-medical-preparation',
  })
  @IsOptional()
  @IsString()
  actionUrl?: string;
}

export class CreateNotificationForUserDto extends CreateNotificationDto {
  @ApiProperty({
    description: 'User ID to send notification to',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: true,
    type: 'string',
    format: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  userId!: string;
}

export class NotificationListItemDto {
  @ApiProperty({
    description: 'Notification UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  id: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'Welcome to ExamPrep!',
  })
  title: string;

  @ApiProperty({
    description: 'First line of message (truncated to 100 chars)',
    example:
      'Your account has been successfully created. Start your exam preparation...',
  })
  messagePreview: string;

  @ApiProperty({
    description: 'Notification tag',
    example: 'system',
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
  })
  tag: string;

  @ApiProperty({
    description: 'Whether notification has been read',
    example: false,
  })
  isRead: boolean;

  @ApiPropertyOptional({
    description: 'URL to redirect when clicked',
    example: '/courses/plab-medical-preparation',
  })
  actionUrl: string | null;

  @ApiProperty({
    description: 'Notification creation timestamp',
    example: '2026-03-21T10:30:00.000Z',
  })
  createdAt: Date;
}

export class NotificationListResponseDto {
  @ApiProperty({ description: 'Request status', example: true })
  status: boolean;

  @ApiProperty({
    description: 'List of notifications',
    type: [NotificationListItemDto],
  })
  data: NotificationListItemDto[];

  @ApiProperty({ description: 'Total unread count' })
  meta: {
    unreadCount: number;
    total: number;
  };
}

export class MarkNotificationReadDto {
  @ApiProperty({
    description: 'Mark notification as read',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  isRead?: boolean;
}

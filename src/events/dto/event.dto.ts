import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsUrl,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '../entities/event.entity';

export class CreateEventDto {
  @ApiProperty({ enum: EventType, example: EventType.ZOOM })
  @IsEnum(EventType)
  @IsNotEmpty()
  eventType: EventType;

  @ApiProperty({ example: 'Pass Exams Like a Pro' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    example: 'Join us for an intensive exam prep session...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2025-01-21T21:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  eventDate: string;

  @ApiPropertyOptional({ example: '123 Main St, City Center' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: 'https://zoom.us/j/123456789' })
  @IsUrl()
  @IsOptional()
  zoomLink?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxAttendees?: number;
}

export class UpdateEventDto {
  @ApiPropertyOptional({ enum: EventType })
  @IsEnum(EventType)
  @IsOptional()
  eventType?: EventType;

  @ApiPropertyOptional({ example: 'Pass Exams Like a Pro - Updated' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description...' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2025-01-22T21:00:00Z' })
  @IsDateString()
  @IsOptional()
  eventDate?: string;

  @ApiPropertyOptional({ example: '456 New Location Ave' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: 'https://zoom.us/j/987654321' })
  @IsUrl()
  @IsOptional()
  zoomLink?: string;

  @ApiPropertyOptional({ example: 150 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxAttendees?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isActive?: boolean;
}

export class QueryEventDto {
  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ enum: EventType })
  @IsEnum(EventType)
  @IsOptional()
  eventType?: EventType;

  @ApiPropertyOptional({ example: 'exam' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  upcomingOnly?: boolean;

  @ApiPropertyOptional({ example: 'eventDate' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ example: 'ASC' })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

export class EventResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  id: string;

  @ApiProperty({ enum: EventType })
  eventType: EventType;

  @ApiProperty({ example: 'Pass Exams Like a Pro' })
  title: string;

  @ApiPropertyOptional({
    example: 'Join us for an intensive exam prep session...',
  })
  description: string;

  @ApiProperty({ example: '2025-01-21T21:00:00Z' })
  eventDate: Date;

  @ApiPropertyOptional({ example: '123 Main St, City Center' })
  location: string;

  @ApiPropertyOptional({ example: 'https://zoom.us/j/123456789' })
  zoomLink: string;

  @ApiProperty({ example: 100 })
  maxAttendees: number;

  @ApiProperty({ example: 45 })
  registeredCount: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether current user is registered',
  })
  isRegistered?: boolean;

  @ApiPropertyOptional({ example: 55 })
  spotsRemaining?: number;

  @ApiProperty({ example: '2025-01-01T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T14:30:00Z' })
  updatedAt: Date;
}

export class RegistrationResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  eventId: string;

  @ApiProperty({ example: 'Pass Exams Like a Pro' })
  eventTitle: string;

  @ApiProperty({ example: EventType.ZOOM })
  eventType: EventType;

  @ApiProperty({ example: '2025-01-21T21:00:00Z' })
  eventDate: Date;

  @ApiPropertyOptional({ example: 'https://zoom.us/j/123456789' })
  zoomLink?: string;

  @ApiPropertyOptional({ example: '123 Main St, City Center' })
  location?: string;

  @ApiProperty({ example: true })
  isConfirmed: boolean;

  @ApiProperty({ example: '2025-01-15T14:30:00Z' })
  registeredAt: Date;
}

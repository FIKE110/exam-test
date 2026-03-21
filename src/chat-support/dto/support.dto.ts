import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TicketStatus,
  TicketPriority,
} from '../entities/support-ticket.entity';

export class CreateTicketDto {
  @ApiProperty({ example: 'Cannot access practice questions' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subject: string;
}

export class SendMessageDto {
  @ApiProperty({
    example:
      'I am having trouble accessing the practice questions. It keeps loading indefinitely.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class TicketResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  id: string;

  @ApiProperty({ example: 'Cannot access practice questions' })
  subject: string;

  @ApiProperty({ enum: TicketStatus })
  status: TicketStatus;

  @ApiProperty({ enum: TicketPriority })
  priority: TicketPriority;

  @ApiProperty({ example: false })
  isResolved: boolean;

  @ApiProperty({ example: '2025-01-15T10:00:00Z' })
  createdAt: Date;

  @ApiPropertyOptional({ example: '2025-01-16T14:30:00Z' })
  resolvedAt?: Date;
}

export class MessageResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  ticketId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440003' })
  senderId: string;

  @ApiProperty({
    example: 'I am having trouble accessing the practice questions.',
  })
  message: string;

  @ApiProperty({ example: false })
  isFromSupport: boolean;

  @ApiProperty({ example: '2025-01-15T10:05:00Z' })
  sentAt: Date;
}

export class ConversationDto {
  @ApiProperty({ type: TicketResponseDto })
  ticket: TicketResponseDto;

  @ApiProperty({ type: [MessageResponseDto] })
  messages: MessageResponseDto[];
}

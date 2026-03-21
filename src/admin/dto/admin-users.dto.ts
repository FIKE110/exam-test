import { IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserListItemDto {
  @ApiProperty({
    description: 'User UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  id: string;

  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User role',
    example: 'User',
    enum: ['User', 'Admin'],
  })
  role: string;

  @ApiProperty({
    description: 'User account status',
    example: 'Active',
    enum: ['Active', 'Suspended'],
  })
  status: string;

  @ApiProperty({
    description: 'Subscription plan',
    example: 'Paid',
    enum: ['Started', 'Paid'],
  })
  plan: string;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2026-03-15T10:30:00.000Z',
  })
  createdAt: Date;
}

export class PaginationDto {
  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 20 })
  limit: number;

  @ApiProperty({ description: 'Total number of items', example: 150 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 8 })
  totalPages: number;
}

export class UserListResponseDto {
  @ApiProperty({ description: 'Request status', example: true })
  status: boolean;

  @ApiProperty({ description: 'List of users', type: [UserListItemDto] })
  data: UserListItemDto[];

  @ApiProperty({ description: 'Pagination metadata' })
  meta: {
    pagination: PaginationDto;
  };
}

export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'New user status',
    example: 'active',
    enum: ['active', 'suspended'],
    required: true,
  })
  @IsEnum(['active', 'suspended'], {
    message: 'Status must be either active or suspended',
  })
  status!: 'active' | 'suspended';
}

export class UpdateUserStatusResponseDto {
  @ApiProperty({ description: 'Request status', example: true })
  status: boolean;

  @ApiProperty({ description: 'Updated user data' })
  data: {
    id: string;
    name: string;
    email: string;
    status: string;
  };
}

export class ErrorResponseDto {
  @ApiProperty({ description: 'Request status', example: false })
  status: boolean;

  @ApiProperty({ description: 'Error details', nullable: true })
  error: {
    code: string;
    message: string;
    details?: any[];
  } | null;
}

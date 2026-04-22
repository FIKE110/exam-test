import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsUrl,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudyMaterialDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Course ID',
  })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({
    example: 'Introduction to Calculus',
    description: 'Material title',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    example: 'A comprehensive guide to basic calculus concepts',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example:
      'Calculus is a branch of mathematics that deals with rates of change...',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ example: 'https://example.com/calculus-guide' })
  @IsUrl()
  @IsOptional()
  link?: string;

  @ApiPropertyOptional({
    example:
      'https://res.cloudinary.com/example/image/upload/v1234567890/material-covers/abc123.jpg',
    description: 'URL to the material cover image',
  })
  @IsUrl()
  @IsOptional()
  coverImageUrl?: string;
}

export class UpdateStudyMaterialDto {
  @ApiPropertyOptional({ example: 'Advanced Calculus Guide' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Updated content...' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ example: 'https://example.com/new-link' })
  @IsUrl()
  @IsOptional()
  link?: string;

  @ApiPropertyOptional({
    example:
      'https://res.cloudinary.com/example/image/upload/v1234567890/material-covers/abc123.jpg',
    description: 'URL to the material cover image',
  })
  @IsUrl()
  @IsOptional()
  coverImageUrl?: string;
}

export class QueryStudyMaterialDto {
  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({ example: 'calculus' })
  @IsString()
  @IsOptional()
  search?: string;
}

export class RateMaterialDto {
  @ApiProperty({ example: 4, description: 'Rating from 0 to 5' })
  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;
}

export class StudyMaterialResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  courseId: string;

  @ApiPropertyOptional({ example: 'Introduction to Calculus' })
  courseTitle?: string;

  @ApiProperty({ example: 'Introduction to Calculus' })
  title: string;

  @ApiPropertyOptional({
    example: 'A comprehensive guide to basic calculus concepts',
  })
  description: string;

  @ApiPropertyOptional({ example: 'Calculus is a branch of mathematics...' })
  content: string;

  @ApiPropertyOptional({ example: 'https://example.com/calculus-guide' })
  link: string;

  @ApiPropertyOptional({
    example:
      'https://res.cloudinary.com/example/image/upload/v1234567890/material-covers/abc123.jpg',
  })
  coverImageUrl: string;

  @ApiProperty({ example: 42 })
  thumbsUpCount: number;

  @ApiProperty({ example: 4.5 })
  averageRating: number;

  @ApiProperty({ example: 128 })
  ratingCount: number;

  @ApiProperty({ example: '2025-01-01T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T14:30:00Z' })
  updatedAt: Date;
}

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  Length,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CourseCategory } from '../entities/course.entity';
import { Difficulty } from '../../common/enums/practice.enum';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Course title',
    example: 'Introduction to Mathematics',
    required: true,
    minLength: 1,
    maxLength: 255,
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @Length(1, 255, { message: 'Title must be between 1 and 255 characters' })
  title: string;

  @ApiProperty({
    description: 'Course description',
    example:
      'A comprehensive introduction to basic mathematical concepts and problem-solving techniques.',
    required: true,
  })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiProperty({
    description: 'Course category',
    enum: CourseCategory,
    example: CourseCategory.MEDICAL,
    required: true,
  })
  @IsEnum(CourseCategory, { message: 'Invalid course category' })
  @IsNotEmpty({ message: 'Category is required' })
  category: CourseCategory;

  @ApiProperty({
    description: 'Difficulty level of the course',
    enum: Difficulty,
    example: Difficulty.MEDIUM,
    required: true,
  })
  @IsEnum(Difficulty, { message: 'Invalid difficulty level' })
  @IsNotEmpty({ message: 'Difficulty level is required' })
  difficultyLevel: Difficulty;

  @ApiProperty({
    description: 'URL to the course thumbnail image',
    example: 'https://example.com/images/math-course.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Thumbnail URL must be a valid URL' })
  thumbnailUrl?: string;

  @ApiProperty({
    description: 'Total course duration in minutes',
    example: 480,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  totalDurationMinutes?: number;
}

export class UpdateCourseDto {
  @ApiProperty({
    description: 'Course title',
    example: 'Advanced Mathematics',
    required: false,
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @Length(1, 255, { message: 'Title must be between 1 and 255 characters' })
  title?: string;

  @ApiProperty({
    description: 'Course description',
    example: 'An advanced course covering complex mathematical topics.',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    description: 'Course category',
    enum: CourseCategory,
    example: CourseCategory.MEDICAL,
    required: false,
  })
  @IsOptional()
  @IsEnum(CourseCategory, { message: 'Invalid course category' })
  category?: CourseCategory;

  @ApiProperty({
    description: 'Difficulty level of the course',
    enum: Difficulty,
    example: Difficulty.HARD,
    required: false,
  })
  @IsOptional()
  @IsEnum(Difficulty, { message: 'Invalid difficulty level' })
  difficultyLevel?: Difficulty;

  @ApiProperty({
    description: 'URL to the course thumbnail image',
    example: 'https://example.com/images/advanced-math.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Thumbnail URL must be a valid URL' })
  thumbnailUrl?: string;

  @ApiProperty({
    description: 'Whether the course is active and available',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProgressDto {
  @ApiProperty({
    description: 'Progress percentage (0-100)',
    example: 45,
    required: false,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Progress percentage must be at least 0' })
  @Max(100, { message: 'Progress percentage must be at most 100' })
  progressPercentage?: number;

  @ApiProperty({
    description: 'Time spent on the course in minutes',
    example: 120,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Time spent must be at least 0' })
  timeSpentMinutes?: number;

  @ApiProperty({
    description: 'ID of the current question being viewed',
    example: 'uuid-string-here',
    required: false,
  })
  @IsOptional()
  @IsString()
  currentQuestionId?: string;
}

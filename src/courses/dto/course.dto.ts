import { IsString, IsNotEmpty, IsOptional, IsUrl, Length, IsEnum } from 'class-validator';
import { CourseCategory } from '../entities/course.entity';
import { Difficulty } from '../../common/enums/practice.enum';

export class CreateCourseDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @Length(1, 255, { message: 'Title must be between 1 and 255 characters' })
  title: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsEnum(CourseCategory, { message: 'Invalid course category' })
  @IsNotEmpty({ message: 'Category is required' })
  category: CourseCategory;

  @IsEnum(Difficulty, { message: 'Invalid difficulty level' })
  @IsNotEmpty({ message: 'Difficulty level is required' })
  difficultyLevel: Difficulty;

  @IsOptional()
  @IsUrl({}, { message: 'Thumbnail URL must be a valid URL' })
  thumbnailUrl?: string;

  @IsOptional()
  totalDurationMinutes?: number;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @Length(1, 255, { message: 'Title must be between 1 and 255 characters' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsEnum(CourseCategory, { message: 'Invalid course category' })
  category?: CourseCategory;

  @IsOptional()
  @IsEnum(Difficulty, { message: 'Invalid difficulty level' })
  difficultyLevel?: Difficulty;

  @IsOptional()
  @IsUrl({}, { message: 'Thumbnail URL must be a valid URL' })
  thumbnailUrl?: string;

  @IsOptional()
  isActive?: boolean;
}

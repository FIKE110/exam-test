import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({
    description: 'Course ID (optional)',
    example: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiProperty({
    description: 'Question text',
    example: 'What is the primary function of the heart?',
  })
  @IsString()
  @IsNotEmpty()
  questionText!: string;

  @ApiProperty({ description: 'Question options', type: [Object] })
  @IsArray()
  options!: { id: string; text: string }[];

  @ApiProperty({ description: 'Correct answer ID', example: 'a' })
  @IsString()
  @IsNotEmpty()
  correctAnswer!: string;

  @ApiProperty({ description: 'Explanation for the correct answer' })
  @IsString()
  @IsNotEmpty()
  explanation!: string;

  @ApiProperty({ enum: ['easy', 'medium', 'hard'] })
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty!: 'easy' | 'medium' | 'hard';

  @ApiProperty({ description: 'Topic name', example: 'Cardiology' })
  @IsString()
  @IsNotEmpty()
  topic!: string;

  @ApiPropertyOptional({
    enum: ['single_choice', 'multiple_choice'],
    default: 'single_choice',
  })
  @IsOptional()
  @IsEnum(['single_choice', 'multiple_choice'])
  questionType?: 'single_choice' | 'multiple_choice';
}

export class UpdateQuestionDto {
  @ApiPropertyOptional({ description: 'Course ID' })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Question text' })
  @IsOptional()
  @IsString()
  questionText?: string;

  @ApiPropertyOptional({ description: 'Question options', type: [Object] })
  @IsOptional()
  @IsArray()
  options?: { id: string; text: string }[];

  @ApiPropertyOptional({ description: 'Correct answer ID' })
  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @ApiPropertyOptional({ description: 'Explanation' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ enum: ['easy', 'medium', 'hard'] })
  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: 'easy' | 'medium' | 'hard';

  @ApiPropertyOptional({ description: 'Topic name' })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional({ enum: ['single_choice', 'multiple_choice'] })
  @IsOptional()
  @IsEnum(['single_choice', 'multiple_choice'])
  questionType?: 'single_choice' | 'multiple_choice';
}

export class FlagQuestionDto {
  @ApiProperty({
    description: 'Reason for flagging',
    example: 'Incorrect answer option',
  })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty } from '../../common/enums/practice.enum';
import { QuestionCount } from './start-practice.dto';

export class MockQuestionOptionDto {
  @ApiProperty({ example: 'A' })
  key: string;

  @ApiProperty({ example: 'This is option A' })
  text: string;
}

export class MockQuestionDto {
  @ApiProperty({ example: 'q1' })
  id: string;

  @ApiProperty({ example: 'What is 2 + 2?' })
  questionText: string;

  @ApiProperty({ type: MockQuestionOptionDto, isArray: true })
  options: MockQuestionOptionDto[];

  @ApiPropertyOptional({ example: 'A' })
  correctAnswer?: string;

  @ApiPropertyOptional({ example: 'Basic arithmetic shows 2 + 2 = 4' })
  explanation?: string;
}

export class PracticeSessionResponseDto {
  @ApiProperty({ example: 'sess_123' })
  sessionId: string;

  @ApiProperty({ example: 'Introduction to Mathematics' })
  courseTitle: string;

  @ApiProperty({ enum: Difficulty, example: Difficulty.EASY })
  difficulty: Difficulty;

  @ApiProperty({ enum: QuestionCount, example: QuestionCount.TEN })
  questionCount: QuestionCount;

  @ApiProperty({ type: MockQuestionDto, isArray: true })
  questions: MockQuestionDto[];

  @ApiProperty({ example: '2025-01-01T10:00:00Z' })
  startedAt: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  timeLimitMinutes: number | null;
}

export class CoursesListDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  id: string;

  @ApiProperty({ example: 'Introduction to Mathematics' })
  title: string;

  @ApiProperty({ example: 'introduction-to-mathematics' })
  slug: string;

  @ApiProperty({ example: 'Basic math concepts and calculations' })
  description: string;
}

export class DifficultyOptionDto {
  @ApiProperty({ example: 'easy' })
  value: Difficulty;

  @ApiProperty({ example: 'Easy' })
  label: string;
}

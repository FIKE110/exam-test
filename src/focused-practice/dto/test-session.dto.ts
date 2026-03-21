import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class QuestionOptionDto {
  @ApiProperty({ example: 'A', description: 'Option key (A, B, C, D)' })
  key: string;

  @ApiProperty({ example: 'This is option A', description: 'Option text' })
  text: string;
}

export class TestQuestionDto {
  @ApiProperty({ example: 'q_123' })
  id: string;

  @ApiProperty({ example: 1, description: 'Question number (1-indexed)' })
  questionNumber: number;

  @ApiProperty({ example: 'What is 2 + 2?' })
  questionText: string;

  @ApiProperty({
    type: QuestionOptionDto,
    isArray: true,
    description: '4 options to choose from',
  })
  options: QuestionOptionDto[];

  @ApiPropertyOptional({
    example: false,
    description: 'Whether user has answered this question',
  })
  isAnswered: boolean;

  @ApiPropertyOptional({
    example: 'A',
    description: 'User selected answer (if answered)',
  })
  selectedAnswer: string | null;
}

export class TestSessionStatusDto {
  @ApiProperty({ example: 'sess_123' })
  sessionId: string;

  @ApiProperty({ example: 'Introduction to Mathematics' })
  courseTitle: string;

  @ApiProperty({ example: 'easy' })
  difficulty: string;

  @ApiProperty({ example: 10, description: 'Total questions in this session' })
  totalQuestions: number;

  @ApiProperty({
    example: 1,
    description: 'Current question number (1-indexed)',
  })
  currentQuestionNumber: number;

  @ApiProperty({ example: 5, description: 'Number of answered questions' })
  answeredCount: number;

  @ApiProperty({ example: 180, description: 'Time remaining in seconds' })
  timeRemainingSeconds: number;

  @ApiProperty({ example: 300, description: 'Total time allowed in seconds' })
  totalTimeSeconds: number;

  @ApiProperty({
    example: false,
    description: 'Whether the session is completed',
  })
  isCompleted: boolean;

  @ApiProperty({
    type: [Number],
    example: [1, 3, 5],
    description: 'Array of answered question numbers',
  })
  answeredQuestionNumbers: number[];
}

export class SubmitAnswerDto {
  @ApiProperty({
    example: 'B',
    description: 'Selected answer key (A, B, C, or D)',
  })
  @IsNotEmpty()
  @IsIn(['A', 'B', 'C', 'D'])
  answer: string;
}

export class NavigateDto {
  @ApiPropertyOptional({
    example: 5,
    description: 'Optional: specific question number to navigate to',
  })
  @IsOptional()
  @IsIn([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
  ])
  questionNumber?: number;
}

export class QuestionResultDto {
  @ApiProperty({ example: 1 })
  questionNumber: number;

  @ApiProperty({ example: 'What is 2 + 2?' })
  questionText: string;

  @ApiProperty({ example: 'B', description: 'Correct answer' })
  correctAnswer: string;

  @ApiPropertyOptional({ example: 'B', description: 'User answer' })
  userAnswer: string | null;

  @ApiProperty({ example: true })
  isCorrect: boolean;

  @ApiProperty({ example: 'Basic arithmetic shows 2 + 2 = 4' })
  explanation: string;
}

export class TestResultDto {
  @ApiProperty({ example: 'sess_123' })
  sessionId: string;

  @ApiProperty({ example: 'Introduction to Mathematics' })
  courseTitle: string;

  @ApiProperty({ example: 'easy' })
  difficulty: string;

  @ApiProperty({ example: 10, description: 'Total questions' })
  totalQuestions: number;

  @ApiProperty({ example: 8, description: 'Correct answers' })
  correctAnswers: number;

  @ApiProperty({ example: 2, description: 'Incorrect answers' })
  incorrectAnswers: number;

  @ApiProperty({ example: 0, description: 'Skipped questions' })
  skippedQuestions: number;

  @ApiProperty({ example: 80, description: 'Accuracy percentage' })
  accuracyPercentage: number;

  @ApiProperty({ example: 300, description: 'Total time spent in seconds' })
  timeSpentSeconds: number;

  @ApiProperty({
    type: [QuestionResultDto],
    description: 'Detailed results per question',
  })
  questionResults: QuestionResultDto[];
}

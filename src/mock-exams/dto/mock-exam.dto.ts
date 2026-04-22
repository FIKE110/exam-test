import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsIn, IsOptional } from 'class-validator';

export class MockExamListItemDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'PLAB 1 Full Mock' })
  title: string;

  @ApiProperty({ example: 'plab-1-full-mock' })
  name: string;

  @ApiProperty({ example: 'Full mock exam for PLAB 1' })
  description: string;

  @ApiProperty({ example: ['medical', 'plab'] })
  tags: string[];

  @ApiProperty({ example: 100 })
  numberOfQuestions: number;

  @ApiProperty({ example: 'intermediate' })
  difficulty: string;

  @ApiProperty({ example: 150 })
  timeLimitMinutes: number;

  @ApiProperty({ example: 0 })
  timesTaken: number;

  @ApiProperty({ example: 0 })
  averageScore: number;
}

export class MockExamQuestionDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 1 })
  questionNumber: number;

  @ApiProperty({ example: 'What is the primary function of the heart?' })
  questionText: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        key: { type: 'string' },
        text: { type: 'string' },
      },
    },
  })
  options: { key: string; text: string }[];

  @ApiPropertyOptional({ example: false })
  isAnswered: boolean;

  @ApiPropertyOptional({ example: null, nullable: true })
  selectedAnswer: string | null;
}

export class StartMockExamResponseDto {
  @ApiProperty({ example: 'uuid' })
  sessionId: string;

  @ApiProperty({ example: 'uuid' })
  mockExamId: string;

  @ApiProperty({ example: 'PLAB 1 Full Mock' })
  title: string;

  @ApiProperty({ example: 100 })
  totalQuestions: number;

  @ApiProperty({ example: 9000 })
  timeLimitSeconds: number;

  @ApiProperty({ type: [MockExamQuestionDto] })
  questions: MockExamQuestionDto[];

  @ApiProperty({ example: '2026-03-21T10:00:00Z' })
  startedAt: string;
}

export class SubmitMockExamAnswerDto {
  @ApiProperty({ example: 'uuid', description: 'Question ID' })
  @IsNotEmpty()
  @IsUUID()
  questionId: string;

  @ApiProperty({ example: 'A', description: 'Selected answer (A, B, C, D)' })
  @IsNotEmpty()
  @IsIn(['A', 'B', 'C', 'D'])
  answer: string;
}

export class SubmitAllMockExamAnswersDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
    example: { 'uuid1': 'A', 'uuid2': 'B' },
    description: 'Object mapping question ID to answer key',
  })
  @IsNotEmpty()
  answers: Record<string, string>;
}

export class MockExamSessionResumeDto {
  @ApiProperty({ example: 'uuid' })
  sessionId: string;

  @ApiProperty({ example: 'uuid' })
  mockExamId: string;

  @ApiProperty({ example: 'PLAB 1 Full Mock' })
  title: string;

  @ApiProperty({ example: 100 })
  totalQuestions: number;

  @ApiProperty({ example: 9000 })
  timeLimitSeconds: number;

  @ApiProperty({ type: [MockExamQuestionDto] })
  questions: MockExamQuestionDto[];

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string', enum: ['A', 'B', 'C', 'D', 'null'] },
    example: { 'uuid1': 'A', 'uuid2': null },
  })
  answers: Record<string, string | null>;

  @ApiProperty({ example: '2026-03-21T10:00:00Z' })
  startedAt: string;
}

export class MockExamQuestionResultDto {
  @ApiProperty({ example: 1 })
  questionNumber: number;

  @ApiProperty({ example: 'uuid' })
  questionId: string;

  @ApiProperty({ example: 'What is the primary function...' })
  questionText: string;

  @ApiProperty({ example: 'A' })
  correctAnswer: string;

  @ApiPropertyOptional({ example: 'A' })
  userAnswer: string | null;

  @ApiProperty({ example: true })
  isCorrect: boolean;

  @ApiProperty({ example: 'The correct answer is A because...' })
  explanation: string;
}

export class MockExamResultDto {
  @ApiProperty({ example: 'uuid' })
  sessionId: string;

  @ApiProperty({ example: 'uuid' })
  mockExamId: string;

  @ApiProperty({ example: 'PLAB 1 Full Mock' })
  title: string;

  @ApiProperty({ example: 100 })
  totalQuestions: number;

  @ApiProperty({ example: 80 })
  correctAnswers: number;

  @ApiProperty({ example: 15 })
  incorrectAnswers: number;

  @ApiProperty({ example: 5 })
  skippedQuestions: number;

  @ApiProperty({ example: 84.21 })
  scorePercentage: number;

  @ApiProperty({ example: 5400 })
  timeSpentSeconds: number;

  @ApiProperty({ example: true })
  isPassed: boolean;

  @ApiProperty({ type: [MockExamQuestionResultDto] })
  questionResults: MockExamQuestionResultDto[];
}

export class GetMockExamQuestionDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  questionNumber?: number;
}

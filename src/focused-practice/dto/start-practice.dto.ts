import { IsUUID, IsNotEmpty, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Difficulty } from '../../common/enums/practice.enum';

export enum QuestionCount {
  TEN = 10,
  TWENTY = 20,
  FIFTY = 50,
}

export class StartPracticeDto {
  @ApiProperty({ description: 'Course ID for the practice session' })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ enum: Difficulty, description: 'Difficulty level' })
  @IsEnum(Difficulty)
  @IsNotEmpty()
  difficulty: Difficulty;

  @ApiProperty({
    enum: QuestionCount,
    description: 'Number of questions',
    example: QuestionCount.TEN,
  })
  @IsInt()
  @Min(QuestionCount.TEN)
  @Max(QuestionCount.FIFTY)
  questionCount: QuestionCount;
}

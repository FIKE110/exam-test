import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GoalType, GoalPeriod } from '../entities/performance-goal.entity';

export class CreateGoalDto {
  @ApiProperty({ description: 'Goal name', example: 'Daily Practice Goal' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Goal description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: GoalType, example: 'daily_questions' })
  @IsEnum(GoalType)
  goalType!: GoalType;

  @ApiProperty({ enum: GoalPeriod, example: 'daily' })
  @IsEnum(GoalPeriod)
  period!: GoalPeriod;

  @ApiProperty({ description: 'Target value to achieve', example: 20 })
  @IsInt()
  @Min(1)
  @Max(10000)
  targetValue!: number;
}

export class UpdateGoalDto {
  @ApiPropertyOptional({ description: 'Goal name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Goal description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Target value', example: 25 })
  @IsOptional()
  @IsInt()
  @Min(1)
  targetValue?: number;
}

export class GoalProgressDto {
  id: string;
  name: string;
  goalType: string;
  period: string;
  targetValue: number;
  currentValue: number;
  progressPercentage: number;
  isCompleted: boolean;
  periodStart: string;
  periodEnd: string;
}

export class MilestoneDto {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  threshold: number;
  rarity: string;
}

export class UserMilestoneDto {
  id: string;
  milestone: MilestoneDto;
  earnedAt: string;
}

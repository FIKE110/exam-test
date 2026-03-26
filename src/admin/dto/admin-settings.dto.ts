import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEmail,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateSettingsDto {
  @ApiPropertyOptional({
    description: 'Platform display name',
    example: 'ExamPrep Pro',
  })
  @IsOptional()
  @IsString({ message: 'Platform name must be a string' })
  platform_name?: string;

  @ApiPropertyOptional({
    description: 'Support email address',
    example: 'help@examprep.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  support_email?: string;

  @ApiPropertyOptional({
    description: 'Number of questions for free plan',
    example: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Free plan questions must be a number' })
  @Min(0, { message: 'Free plan questions must be at least 0' })
  free_plan_questions?: number;

  @ApiPropertyOptional({
    description: 'Number of topics for free plan',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Free plan topics must be a number' })
  @Min(0, { message: 'Free plan topics must be at least 0' })
  free_plan_topics?: number;

  @ApiPropertyOptional({
    description: 'Monthly price for paid plan',
    example: 15,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Paid plan price must be a number' })
  @Min(0, { message: 'Paid plan price must be at least 0' })
  paid_plan_price?: number;

  @ApiPropertyOptional({
    description: 'Enable/disable maintenance mode',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'Maintenance mode must be a boolean' })
  maintenance_mode?: boolean;

  @ApiPropertyOptional({
    description: 'Maintenance mode message',
    example: 'We are currently under scheduled maintenance.',
  })
  @IsOptional()
  @IsString({ message: 'Maintenance message must be a string' })
  maintenance_message?: string;
}

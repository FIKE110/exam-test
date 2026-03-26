import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubscribeDto {
  @ApiProperty({
    description: 'Plan ID to subscribe to',
    example: 'plan_paid',
    required: true,
    enum: ['plan_free', 'plan_paid'],
  })
  @IsString({ message: 'Plan ID must be a string' })
  @IsNotEmpty({ message: 'Plan ID is required' })
  @IsEnum(['plan_free', 'plan_paid'], {
    message: 'Plan ID must be either plan_free or plan_paid',
  })
  planId!: string;
}

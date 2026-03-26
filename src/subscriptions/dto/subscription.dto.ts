import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlanFeatureDto {
  @ApiProperty({ description: 'Feature name', example: 'Access to 5 courses' })
  feature: string;

  @ApiProperty({ description: 'Whether feature is included', example: true })
  included: boolean;
}

export class SubscriptionPlanDto {
  @ApiProperty({ description: 'Plan ID', example: 'plan_free' })
  id: string;

  @ApiProperty({ description: 'Plan name', example: 'Free' })
  name: string;

  @ApiProperty({ description: 'Plan price', example: 0 })
  price: number;

  @ApiProperty({ description: 'Billing cycle', example: 'forever' })
  billingCycle: string;

  @ApiProperty({
    description: 'Plan description',
    example: 'Get started with basic exam preparation features.',
  })
  description: string;

  @ApiProperty({ description: 'Plan features', type: [PlanFeatureDto] })
  features: PlanFeatureDto[];

  @ApiPropertyOptional({
    description: 'Whether plan is popular',
    example: false,
  })
  isPopular?: boolean;
}

export class UserSubscriptionDto {
  @ApiProperty({
    description: 'Subscription ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  id: string;

  @ApiProperty({ description: 'Plan type', example: 'paid' })
  planType: string;

  @ApiPropertyOptional({ description: 'Billing cycle', example: 'monthly' })
  billingCycle: string | null;

  @ApiPropertyOptional({
    description: 'Subscription start date',
    example: '2026-03-01T00:00:00.000Z',
  })
  startedAt: string | null;

  @ApiPropertyOptional({
    description: 'Subscription expiry date',
    example: '2026-04-01T00:00:00.000Z',
  })
  expiresAt: string | null;

  @ApiProperty({ description: 'Whether subscription is active', example: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Plan details',
    type: 'object',
    properties: {
      name: { type: 'string', example: 'Paid' },
      features: {
        type: 'array',
        items: { type: 'string' },
        example: ['Unlimited courses', 'Mock exams', 'AI study assistant'],
      },
    },
  })
  plan: {
    name: string;
    features: string[];
  };
}

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({
    summary: 'Get available subscription plans',
    description:
      'Returns all available subscription plans with their features and pricing.',
  })
  @ApiResponse({
    status: 200,
    description: 'Plans retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'plan_free' },
              name: { type: 'string', example: 'Free' },
              price: { type: 'number', example: 0 },
              billingCycle: { type: 'string', example: 'forever' },
              description: {
                type: 'string',
                example: 'Get started with basic exam preparation features.',
              },
              features: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    feature: { type: 'string', example: 'Access to 5 courses' },
                    included: { type: 'boolean', example: true },
                  },
                },
              },
              isPopular: { type: 'boolean', example: false },
            },
          },
        },
      },
    },
  })
  async getPlans() {
    const plans = await this.subscriptionsService.getPlans();
    return {
      status: true,
      data: plans,
    };
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user subscription',
    description:
      "Returns the authenticated user's current subscription details.",
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            userId: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440002',
            },
            planType: { type: 'string', example: 'paid' },
            billingCycle: {
              type: 'string',
              nullable: true,
              example: 'monthly',
            },
            startedAt: { type: 'string', example: '2026-03-01T00:00:00.000Z' },
            expiresAt: {
              type: 'string',
              nullable: true,
              example: '2026-04-01T00:00:00.000Z',
            },
            isActive: { type: 'boolean', example: true },
            autoRenew: { type: 'boolean', example: true },
            plan: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'plan_paid' },
                name: { type: 'string', example: 'Paid' },
                price: { type: 'number', example: 10 },
                billingCycle: { type: 'string', example: 'monthly' },
                features: {
                  type: 'array',
                  items: { type: 'string' },
                  example: [
                    'Unlimited courses',
                    'Mock exams',
                    'AI study assistant',
                  ],
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async getMySubscription(@CurrentUser('userId') userId: string) {
    const subscription =
      await this.subscriptionsService.getUserSubscription(userId);
    return {
      status: true,
      data: subscription,
    };
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Subscribe to a plan',
    description:
      'Subscribe the authenticated user to a paid plan. (Mock - no actual payment processing)',
  })
  @ApiBody({
    description: 'Subscription details',
    schema: {
      type: 'object',
      required: ['planId'],
      properties: {
        planId: {
          type: 'string',
          description: 'Plan ID to subscribe to',
          example: 'plan_paid',
          enum: ['plan_free', 'plan_paid'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully subscribed to plan',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            userId: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440002',
            },
            planType: { type: 'string', example: 'paid' },
            billingCycle: { type: 'string', example: 'monthly' },
            startedAt: { type: 'string', example: '2026-03-22T10:30:00.000Z' },
            expiresAt: { type: 'string', example: '2026-04-22T10:30:00.000Z' },
            isActive: { type: 'boolean', example: true },
            autoRenew: { type: 'boolean', example: true },
            plan: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'plan_paid' },
                name: { type: 'string', example: 'Paid' },
                price: { type: 'number', example: 10 },
                features: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid plan ID' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async subscribe(
    @CurrentUser('userId') userId: string,
    @Body() subscribeDto: SubscribeDto,
  ) {
    const subscription = await this.subscriptionsService.subscribe(
      userId,
      subscribeDto.planId,
    );
    return {
      status: true,
      data: subscription,
    };
  }

  @Put('cancel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cancel subscription',
    description:
      "Cancel the authenticated user's paid subscription and revert to free plan.",
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            userId: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440002',
            },
            planType: { type: 'string', example: 'free' },
            billingCycle: { type: 'string', nullable: true, example: null },
            startedAt: { type: 'string', example: '2026-03-01T00:00:00.000Z' },
            expiresAt: { type: 'string', example: '2026-03-22T10:30:00.000Z' },
            isActive: { type: 'boolean', example: false },
            autoRenew: { type: 'boolean', example: false },
            plan: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'plan_free' },
                name: { type: 'string', example: 'Free' },
                price: { type: 'number', example: 0 },
                features: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['Access to 5 courses', 'Basic progress tracking'],
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async cancel(@CurrentUser('userId') userId: string) {
    const subscription =
      await this.subscriptionsService.cancelSubscription(userId);
    return {
      status: true,
      data: subscription,
    };
  }
}

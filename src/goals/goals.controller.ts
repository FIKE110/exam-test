import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
import { GoalsService } from './goals.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto';

@ApiTags('Goals & Milestones')
@Controller('goals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GoalsController {
  constructor(private goalsService: GoalsService) {}

  @Get('milestones')
  @ApiOperation({ summary: 'Get all milestones with earned status' })
  @ApiResponse({
    status: 200,
    description: 'Milestones retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            milestones: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: '550e8400-e29b-41d4-a716-446655440001',
                  },
                  name: { type: 'string', example: 'First Steps' },
                  description: {
                    type: 'string',
                    example: 'Answer your first question',
                  },
                  icon: { type: 'string', example: '🎯' },
                  type: { type: 'string', example: 'questions_answered' },
                  threshold: { type: 'number', example: 1 },
                  rarity: { type: 'string', example: 'bronze' },
                  isEarned: { type: 'boolean', example: true },
                },
              },
            },
            earnedCount: { type: 'number', example: 3 },
            totalCount: { type: 'number', example: 14 },
          },
        },
      },
    },
  })
  async getAllMilestones(@CurrentUser('userId') userId: string) {
    return this.goalsService.getAllMilestones(userId);
  }

  @Get('milestones/earned')
  @ApiOperation({ summary: 'Get user earned milestones' })
  @ApiResponse({
    status: 200,
    description: 'Earned milestones retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: '550e8400-e29b-41d4-a716-446655440001',
              },
              milestone: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: '550e8400-e29b-41d4-a716-446655440002',
                  },
                  name: { type: 'string', example: 'First Steps' },
                  description: {
                    type: 'string',
                    example: 'Answer your first question',
                  },
                  icon: { type: 'string', example: '🎯' },
                  type: { type: 'string', example: 'questions_answered' },
                  threshold: { type: 'number', example: 1 },
                  rarity: { type: 'string', example: 'bronze' },
                },
              },
              earnedAt: { type: 'string', example: '2026-03-21T10:00:00Z' },
            },
          },
        },
      },
    },
  })
  async getUserMilestones(@CurrentUser('userId') userId: string) {
    return this.goalsService.getUserMilestones(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get user performance goals' })
  @ApiResponse({
    status: 200,
    description: 'Goals retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: '550e8400-e29b-41d4-a716-446655440001',
              },
              name: { type: 'string', example: 'Daily Practice' },
              description: {
                type: 'string',
                nullable: true,
                example: 'Practice every day',
              },
              goalType: { type: 'string', example: 'daily_questions' },
              period: { type: 'string', example: 'daily' },
              targetValue: { type: 'number', example: 20 },
              currentValue: { type: 'number', example: 15 },
              progressPercentage: { type: 'number', example: 75 },
              isCompleted: { type: 'boolean', example: false },
              periodStart: { type: 'string', example: '2026-03-22' },
              periodEnd: { type: 'string', example: '2026-03-22' },
            },
          },
        },
      },
    },
  })
  async getGoals(@CurrentUser('userId') userId: string) {
    return this.goalsService.getUserGoals(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new performance goal' })
  @ApiBody({
    description: 'Goal creation data',
    schema: {
      type: 'object',
      required: ['name', 'goalType', 'period', 'targetValue'],
      properties: {
        name: {
          type: 'string',
          example: 'Daily Practice Goal',
          description: 'Name of the goal',
        },
        description: {
          type: 'string',
          example: 'Practice 20 questions every day',
          description: 'Optional description',
        },
        goalType: {
          type: 'string',
          enum: [
            'daily_questions',
            'weekly_questions',
            'weekly_study_hours',
            'accuracy_target',
            'streak_days',
          ],
          example: 'daily_questions',
          description: 'Type of goal',
        },
        period: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly', 'ongoing'],
          example: 'daily',
          description: 'Time period for the goal',
        },
        targetValue: {
          type: 'number',
          minimum: 1,
          maximum: 10000,
          example: 20,
          description: 'Target value to achieve',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Goal created successfully',
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
            name: { type: 'string', example: 'Daily Practice Goal' },
            description: {
              type: 'string',
              nullable: true,
              example: 'Practice 20 questions every day',
            },
            goalType: { type: 'string', example: 'daily_questions' },
            period: { type: 'string', example: 'daily' },
            targetValue: { type: 'number', example: 20 },
            currentValue: { type: 'number', example: 0 },
            progressPercentage: { type: 'number', example: 0 },
            isCompleted: { type: 'boolean', example: false },
            periodStart: { type: 'string', example: '2026-03-22' },
            periodEnd: { type: 'string', example: '2026-03-22' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async createGoal(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateGoalDto,
  ) {
    return this.goalsService.createGoal(userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a performance goal' })
  @ApiBody({
    description: 'Goal update data',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Updated Daily Goal',
          description: 'New name for the goal',
        },
        description: {
          type: 'string',
          example: 'Updated description',
          description: 'New description',
        },
        targetValue: {
          type: 'number',
          minimum: 1,
          example: 25,
          description: 'New target value',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Goal updated successfully',
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
            name: { type: 'string', example: 'Updated Daily Goal' },
            targetValue: { type: 'number', example: 25 },
            currentValue: { type: 'number', example: 15 },
            progressPercentage: { type: 'number', example: 60 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async updateGoal(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goalsService.updateGoal(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a performance goal' })
  @ApiResponse({ status: 204, description: 'Goal deleted successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async deleteGoal(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.goalsService.deleteGoal(userId, id);
  }
}

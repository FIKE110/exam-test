import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Get('study-trends')
  @ApiOperation({ summary: 'Get weekly study trends and daily activity' })
  @ApiResponse({
    status: 200,
    description: 'Study trends retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        weeklyTrends: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              week: { type: 'string', example: '2026-W17' },
              questionsAnswered: { type: 'number', example: 225 },
              correctAnswers: { type: 'number', example: 198 },
              accuracy: { type: 'number', example: 88.0 },
              hoursSpent: { type: 'number', example: 13.2 },
            },
          },
        },
        dailyActivity: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', example: '2026-03-21' },
              questionsAnswered: { type: 'number', example: 30 },
              hoursSpent: { type: 'number', example: 1.6 },
              sessionsCompleted: { type: 'number', example: 2 },
            },
          },
        },
        weeklyHours: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              week: { type: 'string', example: '2026-W17' },
              hours: { type: 'number', example: 13.2 },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async getStudyTrends(@CurrentUser('userId') userId: string): Promise<any> {
    return this.progressService.getStudyTrends(userId);
  }

  @Get('weekly-hours-summary')
  @ApiOperation({ summary: 'Get weekly study hours summary' })
  @ApiResponse({
    status: 200,
    description: 'Weekly hours retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async getWeeklyStudyHoursSummary(@CurrentUser('userId') userId: string) {
    return this.progressService.getWeeklyStudyHours(userId);
  }

  @Get('weekly-hours')
  @ApiOperation({ summary: 'Get weekly study hours summary' })
  @ApiResponse({
    status: 200,
    description: 'Weekly hours retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        weeks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              week: { type: 'string' },
              hours: { type: 'number' },
            },
          },
        },
        totalHours: { type: 'number', example: 72.7 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async getWeeklyStudyHours(@CurrentUser('userId') userId: string) {
    return this.progressService.getWeeklyStudyHours(userId);
  }

  @Get('overall')
  @ApiOperation({ summary: 'Get overall performance stats' })
  @ApiResponse({
    status: 200,
    description: 'Overall performance retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalQuestionsAnswered: { type: 'number', example: 1670 },
        totalCorrectAnswers: { type: 'number', example: 1390 },
        overallAccuracy: { type: 'number', example: 83.2 },
        totalHoursStudied: { type: 'number', example: 72.7 },
        totalSessionsCompleted: { type: 'number', example: 45 },
        currentStreak: { type: 'number', example: 7 },
        longestStreak: { type: 'number', example: 14 },
        subjectPerformance: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              courseId: { type: 'string' },
              courseName: { type: 'string', example: 'Pharmacology' },
              questionsAnswered: { type: 'number', example: 450 },
              correctAnswers: { type: 'number', example: 378 },
              accuracy: { type: 'number', example: 84.0 },
            },
          },
        },
        recentSessions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              courseTitle: { type: 'string' },
              score: { type: 'number' },
              completedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async getOverallPerformance(
    @CurrentUser('userId') userId: string,
  ): Promise<any> {
    return this.progressService.getOverallPerformance(userId);
  }

  @Get('streak')
  @ApiOperation({ summary: 'Get streak information' })
  @ApiResponse({
    status: 200,
    description: 'Streak info retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        currentStreak: { type: 'number', example: 7 },
        longestStreak: { type: 'number', example: 14 },
        lastPracticeDate: { type: 'string', format: 'date' },
        weeklyActivity: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              practiced: { type: 'boolean' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async getStreakInfo(@CurrentUser('userId') userId: string) {
    return this.progressService.getStreakInfo(userId);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MockExamsService } from './mock-exams.service';
import { SubmitMockExamAnswerDto, SubmitAllMockExamAnswersDto, MockExamSessionResumeDto } from './dto/mock-exam.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Mock Exams')
@Controller('mock-exams')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MockExamsController {
  constructor(private readonly mockExamsService: MockExamsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all available mock exams' })
  @ApiResponse({
    status: 200,
    description: 'List of available mock exams',
  })
  async getAvailableExams() {
    return this.mockExamsService.getAvailableExams();
  }

  @Get('session/:sessionId/resume')
  @ApiOperation({ summary: 'Resume a mock exam session with all questions and answers' })
  @ApiParam({ name: 'sessionId', description: 'Session UUID' })
  @ApiResponse({
    status: 200,
    description: 'Session data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            sessionId: { type: 'string' },
            mockExamId: { type: 'string' },
            title: { type: 'string' },
            totalQuestions: { type: 'number' },
            timeLimitSeconds: { type: 'number' },
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  questionNumber: { type: 'number' },
                  questionText: { type: 'string' },
                  options: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        key: { type: 'string' },
                        text: { type: 'string' },
                      },
                    },
                  },
                  isAnswered: { type: 'boolean' },
                  selectedAnswer: { type: 'string', nullable: true },
                },
              },
            },
            answers: {
              type: 'object',
              additionalProperties: { type: 'string', nullable: true },
            },
            startedAt: { type: 'string' },
          },
        },
      },
    },
  })
  async getSession(
    @CurrentUser('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<any> {
    return this.mockExamsService.resumeSession(sessionId, userId);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start a mock exam session' })
  @ApiParam({ name: 'id', description: 'Mock exam UUID' })
  @ApiResponse({
    status: 201,
    description: 'Mock exam session started',
  })
  @ApiResponse({ status: 404, description: 'Mock exam not found' })
  async startExam(
    @CurrentUser('userId') userId: string,
    @Param('id') examId: string,
  ) {
    return this.mockExamsService.startExam(userId, examId);
  }

  @Post('session/:sessionId/answer')
  @ApiOperation({ summary: 'Submit an answer for a mock exam question' })
  @ApiParam({ name: 'sessionId', description: 'Session UUID' })
  @ApiBody({
    description: 'Answer submission',
    schema: {
      type: 'object',
      required: ['questionId', 'answer'],
      properties: {
        questionId: { type: 'string', format: 'uuid' },
        answer: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Answer submitted' })
  @ApiResponse({ status: 404, description: 'Session or question not found' })
  submitAnswer(
    @CurrentUser('userId') userId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: SubmitMockExamAnswerDto,
  ) {
    return this.mockExamsService.submitAnswer(
      sessionId,
      userId,
      dto.questionId,
      dto.answer,
    );
  }

  @Post('session/:sessionId/submit-all')
  @ApiOperation({ summary: 'Submit all answers and receive full results' })
  @ApiParam({ name: 'sessionId', description: 'Session UUID' })
  @ApiBody({
    description: 'All answers to submit at once',
    schema: {
      type: 'object',
      required: ['answers'],
      properties: {
        answers: {
          type: 'object',
          additionalProperties: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
          example: { questionId1: 'A', questionId2: 'B' },
          description: 'Mapping of question ID to answer',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'All answers submitted with full results',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            sessionId: { type: 'string' },
            mockExamId: { type: 'string' },
            title: { type: 'string' },
            totalQuestions: { type: 'number' },
            timeLimitSeconds: { type: 'number' },
            correctAnswers: { type: 'number' },
            incorrectAnswers: { type: 'number' },
            skippedQuestions: { type: 'number' },
            scorePercentage: { type: 'number' },
            timeSpentSeconds: { type: 'number' },
            isPassed: { type: 'boolean' },
            questionResults: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  questionNumber: { type: 'number' },
                  questionText: { type: 'string' },
                  correctAnswer: { type: 'string' },
                  userAnswer: { type: 'string', nullable: true },
                  isCorrect: { type: 'boolean' },
                  explanation: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async submitAllAnswers(
    @CurrentUser('userId') userId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: SubmitAllMockExamAnswersDto,
  ) {
    return this.mockExamsService.submitAllAnswers(sessionId, userId, dto.answers);
  }
}
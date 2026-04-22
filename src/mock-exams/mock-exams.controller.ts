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
import { SubmitMockExamAnswerDto } from './dto/mock-exam.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Mock Exams')
@Controller('mock-exams')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MockExamsController {
  constructor(private readonly mockExamsService: MockExamsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available mock exams' })
  @ApiResponse({
    status: 200,
    description: 'List of available mock exams',
  })
  async getAvailableExams() {
    return this.mockExamsService.getAvailableExams();
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

  @Get('session/:sessionId/status')
  @ApiOperation({ summary: 'Get mock exam session status' })
  @ApiParam({ name: 'sessionId', description: 'Session UUID' })
  @ApiResponse({ status: 200, description: 'Session status' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  getSessionStatus(
    @CurrentUser('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.mockExamsService.getSessionStatus(sessionId, userId);
  }

  @Get('session/:sessionId/question')
  @ApiOperation({ summary: 'Get a specific question from the mock exam' })
  @ApiParam({ name: 'sessionId', description: 'Session UUID' })
  @ApiQuery({
    name: 'number',
    description: 'Question number (1-indexed)',
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'Question details' })
  @ApiResponse({ status: 400, description: 'Invalid question number' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  getQuestion(
    @CurrentUser('userId') userId: string,
    @Param('sessionId') sessionId: string,
    @Query('number') questionNumber: number,
  ) {
    return this.mockExamsService.getQuestion(
      sessionId,
      userId,
      Number(questionNumber),
    );
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
        questionId: { type: 'string', format: 'uuid', example: 'uuid' },
        answer: { type: 'string', enum: ['A', 'B', 'C', 'D'], example: 'A' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Answer submitted' })
  @ApiResponse({ status: 400, description: 'Invalid answer' })
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

  @Post('session/:sessionId/complete')
  @ApiOperation({ summary: 'Complete mock exam and get results' })
  @ApiParam({ name: 'sessionId', description: 'Session UUID' })
  @ApiResponse({
    status: 200,
    description: 'Mock exam completed with results',
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async completeExam(
    @CurrentUser('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.mockExamsService.completeExam(sessionId, userId);
  }
}

import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { FocusedPracticeService } from './focused-practice.service';
import { StartPracticeDto, QuestionCount } from './dto/start-practice.dto';
import {
  PracticeSessionResponseDto,
  CoursesListDto,
  DifficultyOptionDto,
} from './dto/practice-response.dto';
import {
  TestQuestionDto,
  TestSessionStatusDto,
  TestResultDto,
  SubmitAnswerDto,
  NavigateDto,
} from './dto/test-session.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Focused Practice')
@Controller('focused-practice')
export class FocusedPracticeController {
  constructor(
    private readonly focusedPracticeService: FocusedPracticeService,
  ) {}

  @Get('courses')
  @Public()
  @ApiOperation({ summary: 'Get available courses for practice' })
  @ApiResponse({
    status: 200,
    description: 'List of courses available for practice',
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
              title: { type: 'string', example: 'PLAB Medical Preparation' },
              slug: { type: 'string', example: 'plab-medical-preparation' },
              description: {
                type: 'string',
                example: 'Comprehensive PLAB exam prep',
              },
              questionCount: { type: 'number', example: 500 },
            },
          },
        },
      },
    },
  })
  getCourses() {
    return this.focusedPracticeService.getCourses();
  }

  @Get('difficulties')
  @Public()
  @ApiOperation({ summary: 'Get available difficulty levels' })
  @ApiResponse({
    status: 200,
    description: 'List of difficulty options',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string', example: 'easy' },
              label: { type: 'string', example: 'Easy' },
              color: { type: 'string', example: '#22c55e' },
            },
          },
        },
      },
    },
  })
  getDifficultyOptions() {
    return this.focusedPracticeService.getDifficultyOptions();
  }

  @Get('question-counts')
  @Public()
  @ApiOperation({ summary: 'Get available question counts' })
  @ApiResponse({
    status: 200,
    description: 'Available question counts',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: { type: 'number', enum: [10, 20, 50] },
          example: [10, 20, 50],
        },
      },
    },
  })
  getQuestionCountOptions() {
    return this.focusedPracticeService.getQuestionCountOptions();
  }

  @Post('start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a focused practice session' })
  @ApiBody({
    description: 'Practice session configuration',
    schema: {
      type: 'object',
      required: ['courseId', 'difficulty', 'questionCount'],
      properties: {
        courseId: {
          type: 'string',
          format: 'uuid',
          example: '550e8400-e29b-41d4-a716-446655440001',
          description: 'Course UUID',
        },
        difficulty: {
          type: 'string',
          enum: ['easy', 'medium', 'hard'],
          example: 'medium',
          description: 'Difficulty level',
        },
        questionCount: {
          type: 'number',
          enum: [10, 20, 50],
          example: 20,
          description: 'Number of questions',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Practice session started successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            sessionId: { type: 'string', example: 'sess_abc123' },
            courseId: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            courseTitle: {
              type: 'string',
              example: 'PLAB Medical Preparation',
            },
            totalQuestions: { type: 'number', example: 20 },
            currentQuestionNumber: { type: 'number', example: 1 },
            difficulty: { type: 'string', example: 'medium' },
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'q_123' },
                  number: { type: 'number', example: 1 },
                  questionText: {
                    type: 'string',
                    example: 'What is the primary function of the heart?',
                  },
                  options: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        key: { type: 'string', example: 'A' },
                        text: { type: 'string', example: 'Pumping blood' },
                      },
                    },
                  },
                  isAnswered: { type: 'boolean', example: false },
                  selectedAnswer: {
                    type: 'string',
                    nullable: true,
                    example: null,
                  },
                  isCorrect: { type: 'boolean', nullable: true, example: null },
                },
              },
            },
            progress: {
              type: 'object',
              properties: {
                answered: { type: 'number', example: 0 },
                correct: { type: 'number', example: 0 },
                remaining: { type: 'number', example: 20 },
                percentage: { type: 'number', example: 0 },
              },
            },
            startedAt: { type: 'string', example: '2026-03-22T10:00:00Z' },
            timeLimitMinutes: { type: 'number', nullable: true, example: null },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error - Invalid input' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  startPractice(
    @CurrentUser('userId') userId: string,
    @Body() startPracticeDto: StartPracticeDto,
  ) {
    return this.focusedPracticeService.startPractice(userId, startPracticeDto);
  }

  @Get('session/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get session status and progress' })
  @ApiResponse({
    status: 200,
    description: 'Current session status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            sessionId: { type: 'string', example: 'sess_abc123' },
            courseTitle: {
              type: 'string',
              example: 'PLAB Medical Preparation',
            },
            difficulty: { type: 'string', example: 'medium' },
            totalQuestions: { type: 'number', example: 20 },
            currentQuestionNumber: { type: 'number', example: 5 },
            answeredCount: { type: 'number', example: 4 },
            correctCount: { type: 'number', example: 3 },
            accuracy: { type: 'number', example: 75.0 },
            timeRemainingSeconds: { type: 'number', example: 1200 },
            totalTimeSeconds: { type: 'number', example: 1800 },
            isCompleted: { type: 'boolean', example: false },
            answeredQuestionNumbers: {
              type: 'array',
              items: { type: 'number' },
              example: [1, 2, 3, 4],
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  getSessionStatus(
    @CurrentUser('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.focusedPracticeService.getSession(sessionId, userId);
  }

  @Get('session/:sessionId/question')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current question with options' })
  @ApiResponse({
    status: 200,
    description: 'Current question details',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'q_123' },
            number: { type: 'number', example: 5 },
            totalQuestions: { type: 'number', example: 20 },
            questionText: {
              type: 'string',
              example: 'What is the primary function of the heart?',
            },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string', example: 'A' },
                  text: { type: 'string', example: 'Pumping blood' },
                },
              },
            },
            isAnswered: { type: 'boolean', example: false },
            selectedAnswer: { type: 'string', nullable: true, example: null },
            isCorrect: { type: 'boolean', nullable: true, example: null },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  getCurrentQuestion(
    @CurrentUser('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.focusedPracticeService.getCurrentQuestion(sessionId, userId);
  }

  @Post('session/:sessionId/answer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit answer for current question' })
  @ApiBody({
    description: 'Answer submission',
    schema: {
      type: 'object',
      required: ['answer'],
      properties: {
        answer: {
          type: 'string',
          enum: ['A', 'B', 'C', 'D'],
          example: 'A',
          description: 'Selected answer key',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Answer submitted successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'q_123' },
            number: { type: 'number', example: 5 },
            questionText: {
              type: 'string',
              example: 'What is the primary function of the heart?',
            },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string', example: 'A' },
                  text: { type: 'string', example: 'Pumping blood' },
                },
              },
            },
            selectedAnswer: { type: 'string', example: 'A' },
            isCorrect: { type: 'boolean', example: true },
            explanation: {
              type: 'string',
              example:
                "The heart's primary function is to pump blood throughout the body...",
            },
            isAnswered: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid answer - must be A, B, C, or D',
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  submitAnswer(
    @CurrentUser('userId') userId: string,
    @Param('sessionId') sessionId: string,
    @Body() submitAnswerDto: SubmitAnswerDto,
  ) {
    return this.focusedPracticeService.submitAnswer(
      sessionId,
      userId,
      submitAnswerDto.answer,
    );
  }

  @Post('session/:sessionId/next')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Navigate to next question or specific question' })
  @ApiBody({
    description: 'Question navigation (optional)',
    schema: {
      type: 'object',
      properties: {
        questionNumber: {
          type: 'number',
          minimum: 1,
          maximum: 50,
          example: 6,
          description: 'Optional: specific question number to navigate to',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Next or specified question',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'q_123' },
            number: { type: 'number', example: 6 },
            totalQuestions: { type: 'number', example: 20 },
            questionText: {
              type: 'string',
              example: 'What is the largest organ in the human body?',
            },
            options: { type: 'array', items: { type: 'object' } },
            isAnswered: { type: 'boolean', example: false },
            selectedAnswer: { type: 'string', nullable: true, example: null },
            isCorrect: { type: 'boolean', nullable: true, example: null },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Already at last question or invalid question number',
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  nextQuestion(
    @CurrentUser('userId') userId: string,
    @Param('sessionId') sessionId: string,
    @Body() navigateDto: NavigateDto,
  ) {
    return this.focusedPracticeService.nextQuestion(
      sessionId,
      userId,
      navigateDto.questionNumber,
    );
  }

  @Post('session/:sessionId/previous')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Navigate to previous question' })
  @ApiResponse({
    status: 200,
    description: 'Previous question',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'q_123' },
            number: { type: 'number', example: 5 },
            questionText: {
              type: 'string',
              example: 'What is the primary function of the heart?',
            },
            options: { type: 'array', items: { type: 'object' } },
            isAnswered: { type: 'boolean', example: true },
            selectedAnswer: { type: 'string', example: 'A' },
            isCorrect: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Already at first question' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  previousQuestion(
    @CurrentUser('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.focusedPracticeService.previousQuestion(sessionId, userId);
  }

  @Post('session/:sessionId/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete session and get results' })
  @ApiResponse({
    status: 200,
    description: 'Session completed with detailed results',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            sessionId: { type: 'string', example: 'sess_abc123' },
            courseTitle: {
              type: 'string',
              example: 'PLAB Medical Preparation',
            },
            difficulty: { type: 'string', example: 'medium' },
            totalQuestions: { type: 'number', example: 20 },
            answeredQuestions: { type: 'number', example: 20 },
            correctAnswers: { type: 'number', example: 16 },
            incorrectAnswers: { type: 'number', example: 4 },
            skippedQuestions: { type: 'number', example: 0 },
            accuracyPercentage: { type: 'number', example: 80.0 },
            timeSpentSeconds: { type: 'number', example: 1200 },
            status: { type: 'string', example: 'completed' },
            completedAt: { type: 'string', example: '2026-03-22T10:30:00Z' },
            questionResults: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  number: { type: 'number', example: 1 },
                  questionText: {
                    type: 'string',
                    example: 'What is the primary function...',
                  },
                  correctAnswer: { type: 'string', example: 'A' },
                  userAnswer: { type: 'string', example: 'A' },
                  isCorrect: { type: 'boolean', example: true },
                  explanation: {
                    type: 'string',
                    example: 'The correct answer is A because...',
                  },
                },
              },
            },
            results: {
              type: 'object',
              properties: {
                passed: { type: 'boolean', example: true },
                grade: { type: 'string', example: 'B+' },
                summary: {
                  type: 'string',
                  example:
                    'Great job! You demonstrated solid understanding of the material.',
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  completeSession(
    @CurrentUser('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.focusedPracticeService.completeSession(sessionId, userId);
  }
}

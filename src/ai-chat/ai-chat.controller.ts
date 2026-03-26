import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AiChatService } from './ai-chat.service';
import { ChatRequestDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('AI Study Chat')
@Controller('ai-chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiChatController {
  constructor(private aiChatService: AiChatService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message to the AI study assistant' })
  @ApiBody({
    description: 'Chat message',
    schema: {
      type: 'object',
      required: ['prompt'],
      properties: {
        prompt: {
          type: 'string',
          example: 'How do I prepare for the PLAB exam?',
          description: 'The user message or question',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'AI response received',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            reply: {
              type: 'string',
              example:
                "That's an excellent question! Let me help you prepare for the PLAB exam. Here are some key strategies:\n\n1. **Understand the Exam Format**: PLAB has two parts - PLAB 1 (180 multiple choice questions) and PLAB 2 (clinical assessment).\n\n2. **Study Resources**: Focus on the GMC's recommended resources and clinical guidelines.\n\n3. **Practice Questions**: Regular practice with exam-style questions is crucial.\n\n4. **Time Management**: Practice answering questions within the time limit.\n\nWould you like me to elaborate on any of these points?",
            },
            sessionId: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            messageCount: { type: 'number', example: 2 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async chat(
    @CurrentUser('userId') userId: string,
    @Body() chatRequest: ChatRequestDto,
  ): Promise<{
    status: boolean;
    data: { reply: string; sessionId: string; messageCount: number };
  }> {
    const result = await this.aiChatService.chat(userId, chatRequest.prompt);
    return {
      status: true,
      data: result,
    };
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get all chat sessions for the user' })
  @ApiResponse({
    status: 200,
    description: 'Sessions retrieved successfully',
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
              title: { type: 'string', example: 'PLAB Exam Preparation' },
              messageCount: { type: 'number', example: 5 },
              lastMessage: {
                type: 'string',
                example: 'Thank you for the advice!',
              },
              createdAt: { type: 'string', example: '2026-03-21T10:00:00Z' },
              updatedAt: { type: 'string', example: '2026-03-21T10:30:00Z' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async getSessions(@CurrentUser('userId') userId: string) {
    return this.aiChatService.getUserSessions(userId);
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get a specific chat session history' })
  @ApiResponse({
    status: 200,
    description: 'Session history retrieved successfully',
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
            title: { type: 'string', example: 'PLAB Exam Preparation' },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: '550e8400-e29b-41d4-a716-446655440010',
                  },
                  role: {
                    type: 'string',
                    enum: ['user', 'assistant'],
                    example: 'user',
                  },
                  content: {
                    type: 'string',
                    example: 'How do I prepare for PLAB?',
                  },
                  createdAt: {
                    type: 'string',
                    example: '2026-03-21T10:00:00Z',
                  },
                },
              },
            },
            createdAt: { type: 'string', example: '2026-03-21T10:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getSessionHistory(
    @CurrentUser('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.aiChatService.getSessionHistory(userId, sessionId);
  }
}

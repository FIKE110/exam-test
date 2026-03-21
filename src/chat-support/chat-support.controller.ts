import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ChatSupportService } from './chat-support.service';
import { CreateTicketDto, SendMessageDto } from './dto/support.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Chat Support')
@Controller('support')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatSupportController {
  constructor(private chatSupportService: ChatSupportService) {}

  @Post('tickets')
  @ApiOperation({ summary: 'Create a new support ticket' })
  @ApiBody({
    description: 'Support ticket data',
    schema: {
      type: 'object',
      required: ['subject', 'message'],
      properties: {
        subject: {
          type: 'string',
          example: "Can't access course materials",
          maxLength: 255,
          description: 'Subject of the support ticket',
        },
        message: {
          type: 'string',
          example:
            "I'm having trouble accessing the course materials for PLAB Prep...",
          description: 'Initial message describing the issue',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Ticket created successfully',
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
            subject: {
              type: 'string',
              example: "Can't access course materials",
            },
            status: { type: 'string', example: 'open' },
            createdAt: { type: 'string', example: '2026-03-22T10:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async createTicket(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateTicketDto,
  ) {
    return this.chatSupportService.createTicket(userId, dto);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Get all my support tickets' })
  @ApiResponse({
    status: 200,
    description: 'Tickets retrieved successfully',
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
              subject: {
                type: 'string',
                example: "Can't access course materials",
              },
              status: {
                type: 'string',
                enum: ['open', 'in_progress', 'closed'],
                example: 'open',
              },
              lastMessage: {
                type: 'string',
                example: 'Thank you for reaching out...',
              },
              lastMessageAt: {
                type: 'string',
                example: '2026-03-22T10:30:00Z',
              },
              createdAt: { type: 'string', example: '2026-03-22T10:00:00Z' },
              updatedAt: { type: 'string', example: '2026-03-22T10:30:00Z' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async getTickets(@CurrentUser('userId') userId: string) {
    return this.chatSupportService.getUserTickets(userId);
  }

  @Get('tickets/:ticketId')
  @ApiOperation({ summary: 'Get conversation for a specific ticket' })
  @ApiResponse({
    status: 200,
    description: 'Conversation retrieved successfully',
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
            subject: {
              type: 'string',
              example: "Can't access course materials",
            },
            status: {
              type: 'string',
              enum: ['open', 'in_progress', 'closed'],
              example: 'open',
            },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: '550e8400-e29b-41d4-a716-446655440010',
                  },
                  senderId: {
                    type: 'string',
                    example: '550e8400-e29b-41d4-a716-446655440002',
                  },
                  senderRole: {
                    type: 'string',
                    enum: ['user', 'admin'],
                    example: 'user',
                  },
                  content: {
                    type: 'string',
                    example:
                      "I'm having trouble accessing the course materials...",
                  },
                  createdAt: {
                    type: 'string',
                    example: '2026-03-22T10:00:00Z',
                  },
                },
              },
            },
            createdAt: { type: 'string', example: '2026-03-22T10:00:00Z' },
            updatedAt: { type: 'string', example: '2026-03-22T10:30:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getConversation(
    @CurrentUser('userId') userId: string,
    @Param('ticketId') ticketId: string,
  ) {
    return this.chatSupportService.getConversation(userId, ticketId);
  }

  @Post('tickets/:ticketId/messages')
  @ApiOperation({ summary: 'Send a message in a support ticket' })
  @ApiBody({
    description: 'Message content',
    schema: {
      type: 'object',
      required: ['message'],
      properties: {
        message: {
          type: 'string',
          example: 'Thank you for the help!',
          description: 'Message content',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440020',
            },
            senderId: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440002',
            },
            senderRole: { type: 'string', example: 'user' },
            content: { type: 'string', example: 'Thank you for the help!' },
            createdAt: { type: 'string', example: '2026-03-22T11:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async sendMessage(
    @CurrentUser('userId') userId: string,
    @Param('ticketId') ticketId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatSupportService.sendMessage(userId, ticketId, dto);
  }

  @Post('tickets/:ticketId/close')
  @ApiOperation({ summary: 'Close a support ticket' })
  @ApiResponse({
    status: 200,
    description: 'Ticket closed successfully',
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
            status: { type: 'string', example: 'closed' },
            updatedAt: { type: 'string', example: '2026-03-22T12:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async closeTicket(
    @CurrentUser('userId') userId: string,
    @Param('ticketId') ticketId: string,
  ) {
    return this.chatSupportService.closeTicket(userId, ticketId);
  }
}

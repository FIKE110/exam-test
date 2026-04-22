import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { DiscussionsService } from './discussions.service';
import { AuthPasswordService } from './auth-password.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import {
  CreatePostDto,
  UpdatePostDto,
  CreateAnswerDto,
  UpdateAnswerDto,
  CreateCommentDto,
} from './dto/discussion.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';

@ApiTags('Discussions')
@Controller('discussions')
export class DiscussionsController {
  constructor(
    private discussionsService: DiscussionsService,
    private authPasswordService: AuthPasswordService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all discussion posts' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    type: String,
    description: 'Filter by course UUID',
  })
  @ApiQuery({
    name: 'tag',
    required: false,
    type: String,
    description: 'Filter by tag',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    example: 'createdAt',
    description: 'Sort field: createdAt, title, views, upvotes',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    example: 'DESC',
    description: 'Sort order: ASC or DESC',
  })
  @ApiResponse({
    status: 200,
    description: 'Posts retrieved successfully',
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
              title: { type: 'string', example: 'How to prepare for PLAB?' },
              content: {
                type: 'string',
                example: 'I have been preparing for...',
              },
              author: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: '550e8400-e29b-41d4-a716-446655440002',
                  },
                  name: { type: 'string', example: 'John Doe' },
                  avatarUrl: { type: 'string', nullable: true, example: null },
                },
              },
              course: {
                type: 'object',
                nullable: true,
                properties: {
                  id: {
                    type: 'string',
                    example: '550e8400-e29b-41d4-a716-446655440003',
                  },
                  title: { type: 'string', example: 'PLAB Prep' },
                },
              },
              tags: {
                type: 'array',
                items: { type: 'string' },
                example: ['plab', 'exam-prep'],
              },
              views: { type: 'number', example: 150 },
              upvotes: { type: 'number', example: 12 },
              isAnswered: { type: 'boolean', example: true },
              answerCount: { type: 'number', example: 5 },
              createdAt: { type: 'string', example: '2026-03-21T10:00:00Z' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 20 },
                total: { type: 'number', example: 100 },
                totalPages: { type: 'number', example: 5 },
              },
            },
          },
        },
      },
    },
  })
  async getPosts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('courseId') courseId?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.discussionsService.getPosts(page, limit, courseId, tag, search, sortBy, sortOrder);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a discussion post with answers' })
  @ApiResponse({
    status: 200,
    description: 'Post retrieved successfully',
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
            title: { type: 'string', example: 'How to prepare for PLAB?' },
            content: {
              type: 'string',
              example: 'I have been preparing for...',
            },
            author: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                avatarUrl: { type: 'string', nullable: true },
              },
            },
            course: { type: 'object', nullable: true },
            tags: { type: 'array', items: { type: 'string' } },
            views: { type: 'number', example: 151 },
            upvotes: { type: 'number', example: 12 },
            isAnswered: { type: 'boolean', example: true },
            answers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: '550e8400-e29b-41d4-a716-446655440010',
                  },
                  content: { type: 'string', example: 'Here are my tips...' },
                  author: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                    },
                  },
                  isAccepted: { type: 'boolean', example: true },
                  upvotes: { type: 'number', example: 5 },
                  createdAt: {
                    type: 'string',
                    example: '2026-03-21T11:00:00Z',
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
  @ApiResponse({ status: 404, description: 'Post not found' })
  async getPost(@Param('id') id: string) {
    return this.discussionsService.getPostById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new discussion post' })
  @ApiBody({
    description: 'Post creation data',
    schema: {
      type: 'object',
      required: ['title', 'content'],
      properties: {
        title: {
          type: 'string',
          example: 'How to prepare for PLAB?',
          maxLength: 255,
        },
        content: {
          type: 'string',
          example: 'I have been preparing for the PLAB exam...',
        },
        courseId: {
          type: 'string',
          format: 'uuid',
          example: '550e8400-e29b-41d4-a716-446655440001',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          example: ['plab', 'exam-prep'],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Post created successfully',
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
            title: { type: 'string', example: 'How to prepare for PLAB?' },
            createdAt: { type: 'string', example: '2026-03-21T10:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async createPost(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreatePostDto,
  ) {
    return this.discussionsService.createPost(userId, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a discussion post' })
  @ApiBody({
    description: 'Post update data',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated Title' },
        content: { type: 'string', example: 'Updated content...' },
        tags: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Post updated successfully',
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
            title: { type: 'string', example: 'Updated Title' },
            updatedAt: { type: 'string', example: '2026-03-21T11:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'You can only edit your own posts' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async updatePost(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.discussionsService.updatePost(userId, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a discussion post' })
  @ApiResponse({ status: 204, description: 'Post deleted successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({
    status: 403,
    description: 'You can only delete your own posts',
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async deletePost(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.discussionsService.deletePost(userId, id);
  }

  @Post(':id/answers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post an answer to a discussion' })
  @ApiBody({
    description: 'Answer content',
    schema: {
      type: 'object',
      required: ['content'],
      properties: {
        content: {
          type: 'string',
          example: 'Here are my tips for preparing for the PLAB exam...',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Answer posted successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440010',
            },
            content: { type: 'string', example: 'Here are my tips...' },
            author: {
              type: 'object',
              properties: { id: { type: 'string' }, name: { type: 'string' } },
            },
            createdAt: { type: 'string', example: '2026-03-21T11:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async createAnswer(
    @CurrentUser('userId') userId: string,
    @Param('id') postId: string,
    @Body() dto: CreateAnswerDto,
  ) {
    return this.discussionsService.createAnswer(userId, postId, dto);
  }

  @Put(':id/answers/:answerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an answer' })
  @ApiBody({
    description: 'Answer update data',
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', example: 'Updated answer content...' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Answer updated successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440010',
            },
            content: { type: 'string', example: 'Updated answer content...' },
            updatedAt: { type: 'string', example: '2026-03-21T12:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({
    status: 403,
    description: 'You can only edit your own answers',
  })
  @ApiResponse({ status: 404, description: 'Answer not found' })
  async updateAnswer(
    @CurrentUser('userId') userId: string,
    @Param('id') postId: string,
    @Param('answerId') answerId: string,
    @Body() dto: UpdateAnswerDto,
  ) {
    return this.discussionsService.updateAnswer(userId, postId, answerId, dto);
  }

  @Delete(':id/answers/:answerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an answer' })
  @ApiResponse({ status: 204, description: 'Answer deleted successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({
    status: 403,
    description: 'You can only delete your own answers',
  })
  @ApiResponse({ status: 404, description: 'Answer not found' })
  async deleteAnswer(
    @CurrentUser('userId') userId: string,
    @Param('id') postId: string,
    @Param('answerId') answerId: string,
  ) {
    return this.discussionsService.deleteAnswer(userId, postId, answerId);
  }

  @Post(':id/answers/:answerId/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept an answer (post author only)' })
  @ApiResponse({
    status: 200,
    description: 'Answer accepted successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440010',
            },
            isAccepted: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({
    status: 403,
    description: 'Only the post author can accept answers',
  })
  @ApiResponse({ status: 404, description: 'Post or answer not found' })
  async acceptAnswer(
    @CurrentUser('userId') userId: string,
    @Param('id') postId: string,
    @Param('answerId') answerId: string,
  ) {
    return this.discussionsService.acceptAnswer(userId, postId, answerId);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Comment on a post' })
  @ApiBody({
    description: 'Comment content',
    schema: {
      type: 'object',
      required: ['content'],
      properties: {
        content: { type: 'string', example: 'Great question!' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Comment posted successfully',
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
            content: { type: 'string', example: 'Great question!' },
            createdAt: { type: 'string', example: '2026-03-21T11:30:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async commentOnPost(
    @CurrentUser('userId') userId: string,
    @Param('id') postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.discussionsService.createCommentOnPost(userId, postId, dto);
  }

  @Post('answers/:answerId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Comment on an answer' })
  @ApiBody({
    description: 'Comment content',
    schema: {
      type: 'object',
      required: ['content'],
      properties: {
        content: { type: 'string', example: 'Thanks for sharing!' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Comment posted successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440021',
            },
            content: { type: 'string', example: 'Thanks for sharing!' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Answer not found' })
  async commentOnAnswer(
    @CurrentUser('userId') userId: string,
    @Param('answerId') answerId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.discussionsService.createCommentOnAnswer(userId, answerId, dto);
  }

  @Post(':id/upvote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upvote a post' })
  @ApiResponse({
    status: 200,
    description: 'Post upvoted successfully',
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
            upvotes: { type: 'number', example: 13 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async upvotePost(
    @CurrentUser('userId') userId: string,
    @Param('id') postId: string,
  ) {
    return this.discussionsService.upvotePost(userId, postId);
  }

  @Post(':id/answers/:answerId/upvote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upvote an answer' })
  @ApiResponse({
    status: 200,
    description: 'Answer upvoted successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440010',
            },
            upvotes: { type: 'number', example: 6 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Answer not found' })
  async upvoteAnswer(
    @CurrentUser('userId') userId: string,
    @Param('id') postId: string,
    @Param('answerId') answerId: string,
  ) {
    return this.discussionsService.upvoteAnswer(userId, answerId);
  }
}

@ApiTags('Password Reset')
@Controller('auth')
export class AuthPasswordController {
  constructor(private authPasswordService: AuthPasswordService) {}

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Sends a password reset email to the user if account exists.',
  })
  @ApiBody({
    description: 'Email address for password reset',
    schema: {
      type: 'object',
      required: ['email'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Reset email sent if account exists',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example:
                'If an account exists with this email, a password reset link will be sent.',
            },
          },
        },
      },
    },
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authPasswordService.forgotPassword(dto);
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password with token',
    description:
      'Resets the password using the token from the forgot-password email.',
  })
  @ApiBody({
    description: 'Password reset data',
    schema: {
      type: 'object',
      required: ['token', 'newPassword'],
      properties: {
        token: {
          type: 'string',
          example: 'abc123def456',
          description: 'Reset token from email',
        },
        newPassword: {
          type: 'string',
          example: 'NewPassword123!',
          minLength: 8,
          description: 'New password (min 8 characters)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Password has been reset successfully.',
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authPasswordService.resetPassword(dto);
  }
}

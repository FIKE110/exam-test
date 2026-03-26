import {
  Controller,
  Get,
  Post,
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
  ApiParam,
} from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { SearchHistoryService } from './search-history.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class AddSearchRequestDto {
  @IsString({ message: 'Query must be a string' })
  @IsNotEmpty({ message: 'Query is required' })
  @MaxLength(255, { message: 'Query must not exceed 255 characters' })
  query!: string;

  @IsOptional()
  @IsEnum(['course', 'question', 'discussion', 'material'], {
    message: 'Type must be one of: course, question, discussion, material',
  })
  type?: string;
}

class GetRecentSearchesResponseDto {
  status: boolean;
  data: string[];
  meta?: {
    timestamp: string;
    request_id: string;
  };
}

class AddSearchResponseDto {
  status: boolean;
  data: null;
  meta?: {
    timestamp: string;
    request_id: string;
  };
}

@ApiTags('Search History')
@Controller('search-history')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchHistoryController {
  constructor(private searchHistoryService: SearchHistoryService) {}

  @Get()
  @ApiOperation({
    summary: 'Get recent search history',
    description:
      'Retrieves the most recent search queries made by the authenticated user, ordered by most recent first. Maximum 50 recent searches are stored.',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent searches retrieved successfully',
    type: GetRecentSearchesResponseDto,
    content: {
      'application/json': {
        example: {
          status: true,
          data: [
            'PLAB 2 exam centers',
            'Pharmacology drug interactions',
            'Cardiology case studies',
            'Medical ethics guidelines',
            'Anatomy nervous system',
          ],
          meta: {
            timestamp: '2026-03-21T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440001',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required - Invalid or missing JWT token',
  })
  async getRecentSearches(@CurrentUser('userId') userId: string) {
    const searches = await this.searchHistoryService.getRecentSearches(userId);
    return { status: true, data: searches };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add search to history',
    description:
      "Records a search query in the user's search history. Duplicate queries within 5 minutes are ignored to prevent spam.",
  })
  @ApiBody({
    description: 'Search query to record',
    schema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: {
          type: 'string',
          description: 'The search query text',
          example: 'PLAB 2 exam centers',
          maxLength: 255,
        },
        type: {
          type: 'string',
          description:
            'Type of search (course, question, discussion, material)',
          example: 'course',
          default: 'course',
          enum: ['course', 'question', 'discussion', 'material'],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Search added to history successfully',
    type: AddSearchResponseDto,
    content: {
      'application/json': {
        example: {
          status: true,
          data: null,
          meta: {
            timestamp: '2026-03-21T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440001',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - Query is required',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['query must be a string', 'query should not be empty'],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required - Invalid or missing JWT token',
  })
  async addSearch(
    @CurrentUser('userId') userId: string,
    @Body() body: AddSearchRequestDto,
  ) {
    await this.searchHistoryService.addSearch(
      userId,
      body.query,
      body.type || 'course',
    );
    return { status: true, data: null };
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Clear all search history',
    description:
      'Removes all search history records for the authenticated user. This action cannot be undone.',
  })
  @ApiResponse({
    status: 204,
    description: 'Search history cleared successfully - No content returned',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required - Invalid or missing JWT token',
  })
  async clearHistory(@CurrentUser('userId') userId: string) {
    await this.searchHistoryService.clearSearchHistory(userId);
    return null;
  }

  @Delete(':query')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete specific search',
    description:
      "Removes a specific search query from the user's search history. The query parameter should be URL-encoded if it contains special characters.",
  })
  @ApiParam({
    name: 'query',
    description: 'The search query to delete (URL-encoded)',
    example: 'PLAB%202%20exam%20centers',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Search deleted successfully - No content returned',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required - Invalid or missing JWT token',
  })
  async deleteSearch(
    @CurrentUser('userId') userId: string,
    @Param('query') query: string,
  ) {
    await this.searchHistoryService.deleteSearch(
      userId,
      decodeURIComponent(query),
    );
    return null;
  }
}

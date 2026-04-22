import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto, QueryEventDto } from './dto/event.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all events' })
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
    name: 'eventType',
    required: false,
    enum: ['zoom', 'physical'],
    description: 'Filter by event type',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'exam',
    description: 'Search term',
  })
  @ApiQuery({
    name: 'upcomingOnly',
    required: false,
    type: Boolean,
    example: false,
    description: 'Show only upcoming events',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    example: 'eventDate',
    description: 'Sort field: eventDate, title, created_at',
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
    description: 'Events retrieved successfully',
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
              eventType: {
                type: 'string',
                enum: ['zoom', 'physical'],
                example: 'zoom',
              },
              title: { type: 'string', example: 'Pass Exams Like a Pro' },
              description: {
                type: 'string',
                example: 'Join us for an intensive exam prep session...',
              },
              eventDate: { type: 'string', example: '2026-03-25T21:00:00Z' },
              location: { type: 'string', nullable: true, example: null },
              zoomLink: {
                type: 'string',
                nullable: true,
                example: 'https://zoom.us/j/123456789',
              },
              maxAttendees: { type: 'number', example: 100 },
              registeredCount: { type: 'number', example: 45 },
              spotsRemaining: { type: 'number', example: 55 },
              isActive: { type: 'boolean', example: true },
              isRegistered: { type: 'boolean', example: false },
              createdAt: { type: 'string', example: '2026-03-01T10:00:00Z' },
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
                total: { type: 'number', example: 5 },
                totalPages: { type: 'number', example: 1 },
              },
            },
          },
        },
      },
    },
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('eventType') eventType?: string,
    @Query('search') search?: string,
    @Query('upcomingOnly', new DefaultValuePipe(false)) upcomingOnly?: boolean,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @CurrentUser('userId') userId?: string,
  ) {
    return this.eventsService.findAll(
      {
        page,
        limit,
        eventType: eventType as any,
        search,
        upcomingOnly,
        sortBy,
        sortOrder,
      },
      userId,
    );
  }

  @Get('my-registrations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my event registrations' })
  @ApiResponse({
    status: 200,
    description: 'Registrations retrieved successfully',
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
              eventId: {
                type: 'string',
                example: '550e8400-e29b-41d4-a716-446655440002',
              },
              eventTitle: { type: 'string', example: 'Pass Exams Like a Pro' },
              eventType: {
                type: 'string',
                enum: ['zoom', 'physical'],
                example: 'zoom',
              },
              eventDate: { type: 'string', example: '2026-03-25T21:00:00Z' },
              zoomLink: {
                type: 'string',
                nullable: true,
                example: 'https://zoom.us/j/123456789',
              },
              location: { type: 'string', nullable: true, example: null },
              isConfirmed: { type: 'boolean', example: true },
              registeredAt: { type: 'string', example: '2026-03-15T14:30:00Z' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async getMyRegistrations(@CurrentUser('userId') userId: string) {
    return this.eventsService.getMyRegistrations(userId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({
    status: 200,
    description: 'Event retrieved successfully',
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
            eventType: {
              type: 'string',
              enum: ['zoom', 'physical'],
              example: 'zoom',
            },
            title: { type: 'string', example: 'Pass Exams Like a Pro' },
            description: {
              type: 'string',
              example: 'Join us for an intensive exam prep session...',
            },
            eventDate: { type: 'string', example: '2026-03-25T21:00:00Z' },
            location: { type: 'string', nullable: true, example: null },
            zoomLink: {
              type: 'string',
              nullable: true,
              example: 'https://zoom.us/j/123456789',
            },
            maxAttendees: { type: 'number', example: 100 },
            registeredCount: { type: 'number', example: 45 },
            spotsRemaining: { type: 'number', example: 55 },
            isActive: { type: 'boolean', example: true },
            isRegistered: { type: 'boolean', example: true },
            createdAt: { type: 'string', example: '2026-03-01T10:00:00Z' },
            updatedAt: { type: 'string', example: '2026-03-01T10:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId?: string,
  ) {
    return this.eventsService.findOne(id, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new event (Admin only)' })
  @ApiBody({
    description: 'Event data',
    schema: {
      type: 'object',
      required: ['eventType', 'title', 'eventDate'],
      properties: {
        eventType: {
          type: 'string',
          enum: ['zoom', 'physical'],
          example: 'zoom',
          description: 'Type of event',
        },
        title: {
          type: 'string',
          example: 'Pass Exams Like a Pro',
          maxLength: 255,
        },
        description: {
          type: 'string',
          example: 'Join us for an intensive exam prep session...',
        },
        eventDate: {
          type: 'string',
          format: 'date-time',
          example: '2026-03-25T21:00:00Z',
        },
        location: {
          type: 'string',
          example: '123 Main St, City Center',
          description: 'Required for physical events',
        },
        zoomLink: {
          type: 'string',
          format: 'uri',
          example: 'https://zoom.us/j/123456789',
          description: 'Required for zoom events',
        },
        maxAttendees: {
          type: 'number',
          minimum: 1,
          example: 100,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
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
            eventType: { type: 'string', example: 'zoom' },
            title: { type: 'string', example: 'Pass Exams Like a Pro' },
            eventDate: { type: 'string', example: '2026-03-25T21:00:00Z' },
            createdAt: { type: 'string', example: '2026-03-22T10:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async create(@Body() createDto: CreateEventDto) {
    return this.eventsService.create(createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an event (Admin only)' })
  @ApiBody({
    description: 'Event update data',
    schema: {
      type: 'object',
      properties: {
        eventType: {
          type: 'string',
          enum: ['zoom', 'physical'],
          example: 'zoom',
        },
        title: { type: 'string', example: 'Updated Event Title' },
        description: { type: 'string', example: 'Updated description...' },
        eventDate: {
          type: 'string',
          format: 'date-time',
          example: '2026-03-26T21:00:00Z',
        },
        location: { type: 'string', example: '456 New Location Ave' },
        zoomLink: {
          type: 'string',
          format: 'uri',
          example: 'https://zoom.us/j/987654321',
        },
        maxAttendees: { type: 'number', minimum: 1, example: 150 },
        isActive: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
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
            title: { type: 'string', example: 'Updated Event Title' },
            maxAttendees: { type: 'number', example: 150 },
            updatedAt: { type: 'string', example: '2026-03-22T11:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateEventDto) {
    return this.eventsService.update(id, updateDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an event (Admin only)' })
  @ApiResponse({ status: 204, description: 'Event deleted successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async delete(@Param('id') id: string) {
    await this.eventsService.delete(id);
    return null;
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register for an event' })
  @ApiResponse({
    status: 201,
    description: 'Successfully registered for event',
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
            eventId: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440002',
            },
            isConfirmed: { type: 'boolean', example: true },
            registeredAt: { type: 'string', example: '2026-03-22T10:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Event full or already passed' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 409, description: 'Already registered' })
  async register(
    @CurrentUser('userId') userId: string,
    @Param('id') eventId: string,
  ) {
    return this.eventsService.register(userId, eventId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel event registration' })
  @ApiResponse({
    status: 204,
    description: 'Registration cancelled successfully',
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async unregister(
    @CurrentUser('userId') userId: string,
    @Param('id') eventId: string,
  ) {
    await this.eventsService.unregister(userId, eventId);
    return null;
  }
}

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description:
      'Returns a simple greeting message to verify that the API is running and accessible. This endpoint does not require authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is running and healthy',
    content: {
      'application/json': {
        example: {
          status: true,
          data: {
            message: 'Welcome to ExamPrep API',
            version: '1.0.0',
            timestamp: '2026-03-21T10:30:00.000Z',
          },
          meta: {
            timestamp: '2026-03-21T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440001',
          },
        },
      },
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}

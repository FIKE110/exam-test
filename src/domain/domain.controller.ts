import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DomainService } from './domain.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Domain Reference')
@Controller('domain')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Get('professions')
  @Public()
  @ApiOperation({ summary: 'Get all professions' })
  @ApiResponse({
    status: 200,
    description: 'Returns all active professions',
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
              name: { type: 'string', example: 'Medical Doctor' },
              description: {
                type: 'string',
                example: 'Professional medical practitioners',
              },
              isActive: { type: 'boolean', example: true },
              createdAt: { type: 'string', example: '2026-03-01T10:00:00Z' },
            },
          },
        },
      },
    },
  })
  async getProfessions() {
    const professions = await this.domainService.getAllProfessions();
    return { status: true, data: professions };
  }

  @Get('professions/:id')
  @Public()
  @ApiOperation({ summary: 'Get profession by ID' })
  @ApiParam({
    name: 'id',
    description: 'Profession UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the profession',
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
            name: { type: 'string', example: 'Medical Doctor' },
            description: {
              type: 'string',
              example: 'Professional medical practitioners',
            },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', example: '2026-03-01T10:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Profession not found' })
  async getProfessionById(@Param('id') id: string) {
    const profession = await this.domainService.getProfessionById(id);
    return { status: true, data: profession };
  }

  @Get('sectors')
  @Public()
  @ApiOperation({ summary: 'Get all sectors' })
  @ApiResponse({
    status: 200,
    description: 'Returns all active sectors',
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
                example: '550e8400-e29b-41d4-a716-446655440002',
              },
              name: { type: 'string', example: 'Healthcare' },
              description: {
                type: 'string',
                example:
                  'Healthcare sector including hospitals, clinics, and medical services',
              },
              isActive: { type: 'boolean', example: true },
              createdAt: { type: 'string', example: '2026-03-01T10:00:00Z' },
            },
          },
        },
      },
    },
  })
  async getSectors() {
    const sectors = await this.domainService.getAllSectors();
    return { status: true, data: sectors };
  }

  @Get('sectors/:id')
  @Public()
  @ApiOperation({ summary: 'Get sector by ID' })
  @ApiParam({
    name: 'id',
    description: 'Sector UUID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the sector',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440002',
            },
            name: { type: 'string', example: 'Healthcare' },
            description: {
              type: 'string',
              example:
                'Healthcare sector including hospitals, clinics, and medical services',
            },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', example: '2026-03-01T10:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Sector not found' })
  async getSectorById(@Param('id') id: string) {
    const sector = await this.domainService.getSectorById(id);
    return { status: true, data: sector };
  }

  @Get('exam-types')
  @Public()
  @ApiOperation({ summary: 'Get all exam types or filter by sector' })
  @ApiQuery({
    name: 'sectorId',
    required: false,
    description: 'Filter exam types by sector UUID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns exam types',
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
                example: '550e8400-e29b-41d4-a716-446655440003',
              },
              name: { type: 'string', example: 'PLAB' },
              description: {
                type: 'string',
                example:
                  'Professional and Linguistic Assessments Board test for international doctors',
              },
              sectorId: {
                type: 'string',
                example: '550e8400-e29b-41d4-a716-446655440002',
              },
              isActive: { type: 'boolean', example: true },
              createdAt: { type: 'string', example: '2026-03-01T10:00:00Z' },
            },
          },
        },
      },
    },
  })
  async getExamTypes(@Query('sectorId') sectorId?: string) {
    if (sectorId) {
      const examTypes = await this.domainService.getExamTypesBySector(sectorId);
      return { status: true, data: examTypes };
    }
    const examTypes = await this.domainService.getAllExamTypes();
    return { status: true, data: examTypes };
  }

  @Get('exam-types/:id')
  @Public()
  @ApiOperation({ summary: 'Get exam type by ID' })
  @ApiParam({
    name: 'id',
    description: 'Exam type UUID',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the exam type',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440003',
            },
            name: { type: 'string', example: 'PLAB' },
            description: {
              type: 'string',
              example:
                'Professional and Linguistic Assessments Board test for international doctors',
            },
            sectorId: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440002',
            },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', example: '2026-03-01T10:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Exam type not found' })
  async getExamTypeById(@Param('id') id: string) {
    const examType = await this.domainService.getExamTypeById(id);
    return { status: true, data: examType };
  }
}

import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DomainService } from './domain.service';
import { Profession } from './entities/profession.entity';
import { Sector } from './entities/sector.entity';
import { ExamType } from './entities/exam-type.entity';

@ApiTags('Domain')
@Controller('api/domain')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Get('professions')
  @ApiOperation({ summary: 'Get all professions' })
  @ApiResponse({
    status: 200,
    description: 'Returns all active professions',
    type: [Profession],
  })
  async getProfessions(): Promise<Profession[]> {
    return this.domainService.getAllProfessions();
  }

  @Get('professions/:id')
  @ApiOperation({ summary: 'Get profession by ID' })
  @ApiParam({ name: 'id', description: 'Profession UUID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the profession',
    type: Profession,
  })
  @ApiResponse({ status: 404, description: 'Profession not found' })
  async getProfessionById(@Param('id') id: string): Promise<Profession> {
    return this.domainService.getProfessionById(id);
  }

  @Get('sectors')
  @ApiOperation({ summary: 'Get all sectors' })
  @ApiResponse({
    status: 200,
    description: 'Returns all active sectors',
    type: [Sector],
  })
  async getSectors(): Promise<Sector[]> {
    return this.domainService.getAllSectors();
  }

  @Get('sectors/:id')
  @ApiOperation({ summary: 'Get sector by ID' })
  @ApiParam({ name: 'id', description: 'Sector UUID' })
  @ApiResponse({ status: 200, description: 'Returns the sector', type: Sector })
  @ApiResponse({ status: 404, description: 'Sector not found' })
  async getSectorById(@Param('id') id: string): Promise<Sector> {
    return this.domainService.getSectorById(id);
  }

  @Get('exam-types')
  @ApiOperation({ summary: 'Get all exam types or filter by sector' })
  @ApiQuery({
    name: 'sectorId',
    required: false,
    description: 'Filter exam types by sector UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns exam types',
    type: [ExamType],
  })
  async getExamTypes(
    @Query('sectorId') sectorId?: string,
  ): Promise<ExamType[]> {
    if (sectorId) {
      return this.domainService.getExamTypesBySector(sectorId);
    }
    return this.domainService.getAllExamTypes();
  }

  @Get('exam-types/:id')
  @ApiOperation({ summary: 'Get exam type by ID' })
  @ApiParam({ name: 'id', description: 'Exam type UUID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the exam type',
    type: ExamType,
  })
  @ApiResponse({ status: 404, description: 'Exam type not found' })
  async getExamTypeById(@Param('id') id: string): Promise<ExamType> {
    return this.domainService.getExamTypeById(id);
  }
}

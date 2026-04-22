import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { StudyMaterialsService } from './study-materials.service';
import {
  CreateStudyMaterialDto,
  UpdateStudyMaterialDto,
  QueryStudyMaterialDto,
  RateMaterialDto,
} from './dto/study-material.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UploadService, FileCategory } from '../upload/services/upload.service';

@ApiTags('Study Materials')
@Controller('study-materials')
export class StudyMaterialsController {
  constructor(
    private studyMaterialsService: StudyMaterialsService,
    private uploadService: UploadService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all study materials' })
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
    name: 'search',
    required: false,
    type: String,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    example: 'title',
    description: 'Sort field: title, created_at, average_rating, thumbs_up_count',
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
    description: 'Study materials retrieved successfully',
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
              title: { type: 'string', example: 'Cardiology Fundamentals' },
              description: {
                type: 'string',
                example: 'Essential concepts in cardiology...',
              },
              content: { type: 'string', example: '...' },
              fileUrl: {
                type: 'string',
                nullable: true,
                example: 'https://example.com/materials/cardiology.pdf',
              },
              courseId: {
                type: 'string',
                example: '550e8400-e29b-41d4-a716-446655440002',
              },
              course: {
                type: 'object',
                nullable: true,
                properties: {
                  id: {
                    type: 'string',
                    example: '550e8400-e29b-41d4-a716-446655440002',
                  },
                  title: { type: 'string', example: 'PLAB Prep' },
                },
              },
              createdBy: {
                type: 'string',
                example: '550e8400-e29b-41d4-a716-446655440003',
              },
              createdAt: { type: 'string', example: '2026-03-21T10:00:00Z' },
              reactionCount: { type: 'number', example: 25 },
              averageRating: { type: 'number', example: 4.5 },
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
                total: { type: 'number', example: 10 },
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
    @Query('courseId') courseId?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.studyMaterialsService.findAll({
      page,
      limit,
      courseId,
      search,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get study material by ID' })
  @ApiResponse({
    status: 200,
    description: 'Study material retrieved successfully',
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
            title: { type: 'string', example: 'Cardiology Fundamentals' },
            description: {
              type: 'string',
              example: 'Essential concepts in cardiology...',
            },
            content: {
              type: 'string',
              example: 'Full study material content...',
            },
            fileUrl: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/materials/cardiology.pdf',
            },
            courseId: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440002',
            },
            course: { type: 'object', nullable: true },
            reactionCount: { type: 'number', example: 25 },
            averageRating: { type: 'number', example: 4.5 },
            createdAt: { type: 'string', example: '2026-03-21T10:00:00Z' },
            updatedAt: { type: 'string', example: '2026-03-21T10:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Study material not found' })
  async findOne(@Param('id') id: string) {
    return this.studyMaterialsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new study material (Admin only)' })
  @ApiBody({
    description: 'Study material data',
    schema: {
      type: 'object',
      required: ['title', 'content', 'courseId'],
      properties: {
        title: {
          type: 'string',
          example: 'New Study Material',
          maxLength: 255,
        },
        description: {
          type: 'string',
          example: 'Description of the material...',
        },
        content: {
          type: 'string',
          example: 'Full content of the study material...',
        },
        courseId: {
          type: 'string',
          format: 'uuid',
          example: '550e8400-e29b-41d4-a716-446655440001',
        },
        fileUrl: {
          type: 'string',
          format: 'uri',
          example: 'https://example.com/file.pdf',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Study material created successfully',
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
            title: { type: 'string', example: 'New Study Material' },
            createdAt: { type: 'string', example: '2026-03-22T10:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async create(@Body() createDto: CreateStudyMaterialDto) {
    return this.studyMaterialsService.create(createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a study material (Admin only)' })
  @ApiBody({
    description: 'Study material update data',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated Title' },
        description: { type: 'string', example: 'Updated description...' },
        content: { type: 'string', example: 'Updated content...' },
        fileUrl: {
          type: 'string',
          format: 'uri',
          example: 'https://example.com/updated-file.pdf',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Study material updated successfully',
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
            updatedAt: { type: 'string', example: '2026-03-22T11:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Study material not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateStudyMaterialDto,
  ) {
    return this.studyMaterialsService.update(id, updateDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a study material (Admin only)' })
  @ApiResponse({
    status: 204,
    description: 'Study material deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Study material not found' })
  async delete(@Param('id') id: string) {
    await this.studyMaterialsService.delete(id);
    return null;
  }

  @Post(':id/react')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add thumbs up reaction to a study material' })
  @ApiResponse({
    status: 200,
    description: 'Reaction added successfully',
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
            reactionCount: { type: 'number', example: 26 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Study material not found' })
  async addReaction(@Param('id') id: string) {
    return this.studyMaterialsService.addReaction(id);
  }

  @Post(':id/rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rate a study material (0-5)' })
  @ApiBody({
    description: 'Rating value',
    schema: {
      type: 'object',
      required: ['rating'],
      properties: {
        rating: {
          type: 'number',
          minimum: 0,
          maximum: 5,
          example: 5,
          description: 'Rating from 0 to 5 stars',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Rating submitted successfully',
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
            averageRating: { type: 'number', example: 4.6 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Rating must be between 0 and 5' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Study material not found' })
  async addRating(@Param('id') id: string, @Body() rateDto: RateMaterialDto) {
    return this.studyMaterialsService.addRating(id, rateDto.rating);
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload cover image for a study material (Admin only)',
    description:
      'Uploads a cover image for a study material. Accepts image files only (jpg, png, gif, webp). Max file size: 5MB. The image is stored on Cloudinary (or local filesystem as fallback) and the material cover image URL is updated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Study material UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    description: 'Image file to upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (max 5MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded and cover image URL updated successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            materialId: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            coverImageUrl: {
              type: 'string',
              example:
                'https://res.cloudinary.com/demo/image/upload/v1234567890/material-covers/abc123.jpg',
            },
          },
        },
        error: { type: 'null', example: null },
        meta: {
          type: 'object',
          properties: {
            timestamp: { type: 'string', example: '2026-03-21T10:30:00Z' },
            request_id: { type: 'string', example: 'uuid' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - Invalid file type or no file provided',
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Study material not found' })
  async uploadCoverImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const { url } = await this.uploadService.uploadFile(
      file,
      FileCategory.MATERIAL_COVER,
    );

    return this.studyMaterialsService.updateCoverImage(id, url);
  }
}

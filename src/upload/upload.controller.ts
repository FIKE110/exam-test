import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as path from 'path';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UploadService, FileCategory } from './services/upload.service';

class UploadAvatarResponseDto {
  status: boolean;
  data: {
    url: string;
    key: string;
  };
  meta?: {
    timestamp: string;
    request_id: string;
  };
}

class UploadMaterialResponseDto {
  status: boolean;
  data: {
    url: string;
    key: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
  };
  meta?: {
    timestamp: string;
    request_id: string;
  };
}

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(new Error('Only image files are allowed'), false);
        }
        callback(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar image file to upload',
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG, PNG, GIF, WebP - max 5MB)',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Upload user avatar',
    description:
      'Uploads a profile picture for the authenticated user. Supported formats: JPEG, PNG, GIF, WebP. Maximum file size: 5MB. If a previous avatar exists, it will be replaced.',
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar uploaded successfully',
    type: UploadAvatarResponseDto,
    content: {
      'application/json': {
        example: {
          status: true,
          data: {
            url: 'https://res.cloudinary.com/example/image/upload/v1234567890/avatars/550e8400-e29b-41d4-a716-446655440001/avatar.jpg',
            key: 'avatars/550e8400-e29b-41d4-a716-446655440001/avatar.jpg',
          },
          meta: {
            timestamp: '2026-03-21T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440002',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - Invalid file or file too large',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['Only image files are allowed'],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required - Invalid or missing JWT token',
  })
  async uploadAvatar(
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.uploadService.uploadFile(
      file,
      FileCategory.AVATAR,
      userId,
    );
    return {
      status: true,
      data: result,
    };
  }

  @Post('material')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Study material file to upload',
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Study material file (PDF, DOC, DOCX, TXT, MP4, MP3 - max 50MB)',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Upload study material',
    description:
      'Uploads a study material file for the authenticated user. Supported formats: PDF, DOC, DOCX, TXT, MP4, MP3. Maximum file size: 50MB.',
  })
  @ApiResponse({
    status: 200,
    description: 'Material uploaded successfully',
    type: UploadMaterialResponseDto,
    content: {
      'application/json': {
        example: {
          status: true,
          data: {
            url: 'https://res.cloudinary.com/example/image/upload/v1234567890/materials/550e8400-e29b-41d4-a716-446655440001/document.pdf',
            key: 'materials/550e8400-e29b-41d4-a716-446655440001/document.pdf',
            filename: 'document.pdf',
            originalName: 'pharmacology-notes.pdf',
            mimeType: 'application/pdf',
            size: 2456789,
          },
          meta: {
            timestamp: '2026-03-21T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440003',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - File too large or invalid format',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['File too large. Maximum size is 50MB'],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required - Invalid or missing JWT token',
  })
  async uploadMaterial(
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.uploadService.uploadFile(
      file,
      FileCategory.MATERIAL,
      userId,
    );
    return {
      status: true,
      data: result,
    };
  }
}

@ApiTags('Files')
@Controller('uploads')
export class FileController {
  @Get(':folder/:subfolder/:filename')
  @ApiOperation({
    summary: 'Get uploaded file',
    description:
      'Serves an uploaded file from the local uploads directory. This endpoint is for local development. In production, files should be served directly from Cloudinary CDN.',
  })
  @ApiParam({
    name: 'folder',
    description: 'First level folder name',
    example: 'avatars',
    type: 'string',
  })
  @ApiParam({
    name: 'subfolder',
    description: 'Second level folder name (user ID or category)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    type: 'string',
  })
  @ApiParam({
    name: 'filename',
    description: 'Name of the file',
    example: 'avatar.jpg',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'File served successfully',
    content: {
      'application/json': {
        example: {
          status: true,
          data: 'Binary file content',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'File not found - The specified file does not exist',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'File not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async serveFile(
    @Param('folder') folder: string,
    @Param('subfolder') subfolder: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = path.join('./uploads', folder, subfolder, filename);
    res.sendFile(filePath, { root: '.' });
  }
}

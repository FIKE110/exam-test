import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export enum FileCategory {
  AVATAR = 'avatars',
  MATERIAL = 'materials',
  DOCUMENT = 'documents',
  COURSE_IMAGE = 'course-images',
}

@Injectable()
export class UploadService {
  private cloudinaryConfigured = false;

  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret && cloudName !== 'your-cloud-name') {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.cloudinaryConfigured = true;
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    category: FileCategory,
    userId?: string,
  ): Promise<{ url: string; publicId: string }> {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    const folder = userId ? `${category}/${userId}` : category;

    if (this.cloudinaryConfigured) {
      return this.uploadToCloudinary(file, folder, filename);
    }

    return this.uploadToLocal(file, folder, filename);
  }

  private async uploadToCloudinary(
    file: Express.Multer.File,
    folder: string,
    filename: string,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: filename.replace(extname(filename), ''),
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  private async uploadToLocal(
    file: Express.Multer.File,
    folder: string,
    filename: string,
  ): Promise<{ url: string; publicId: string }> {
    const fs = require('fs');
    const uploadPath = this.configService.get('LOCAL_UPLOAD_PATH', './uploads');
    const fullDir = path.join(uploadPath, folder);
    const fullPath = path.join(fullDir, filename);

    if (!fs.existsSync(fullDir)) {
      fs.mkdirSync(fullDir, { recursive: true });
    }

    fs.writeFileSync(fullPath, file.buffer);

    const baseUrl = this.configService.get('APP_URL', 'http://localhost:3001');
    const url = `${baseUrl}/uploads/${folder}/${filename}`;

    return {
      url,
      publicId: `${folder}/${filename.replace(extname(filename), '')}`,
    };
  }

  async deleteFile(publicId: string): Promise<void> {
    if (this.cloudinaryConfigured) {
      await cloudinary.uploader.destroy(publicId);
    } else {
      const fs = require('fs');
      const uploadPath = this.configService.get(
        'LOCAL_UPLOAD_PATH',
        './uploads',
      );
      const filePath = path.join(uploadPath, publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  async getSignedUrl(publicId: string): Promise<string> {
    if (this.cloudinaryConfigured) {
      return cloudinary.url(publicId, {
        sign_url: true,
        secure: true,
      });
    }

    const baseUrl = this.configService.get('APP_URL', 'http://localhost:3001');
    return `${baseUrl}/uploads/${publicId}`;
  }
}

function extname(filename: string): string {
  const base = path.basename(filename);
  const lastDot = base.lastIndexOf('.');
  return lastDot >= 0 ? base.substring(lastDot) : '';
}

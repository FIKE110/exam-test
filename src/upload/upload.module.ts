import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { memoryStorage } from 'multer';
import { UploadController } from './upload.controller';
import { FileController } from './upload.controller';
import { UploadService } from './services/upload.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UploadController, FileController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}

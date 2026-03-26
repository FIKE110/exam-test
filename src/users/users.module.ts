import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SearchHistoryController } from './search-history.controller';
import { SearchHistoryService } from './search-history.service';
import { User } from './entities/user.entity';
import { UserSearchHistory } from './entities/user-search-history.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSearchHistory]), UploadModule],
  controllers: [UsersController, SearchHistoryController],
  providers: [UsersService, SearchHistoryService],
  exports: [UsersService, SearchHistoryService],
})
export class UsersModule {}

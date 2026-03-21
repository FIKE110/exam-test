import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { UserStreak } from './entities/user-streak.entity';
import { PracticeSession } from '../practice/entities/practice-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserStreak, PracticeSession])],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}

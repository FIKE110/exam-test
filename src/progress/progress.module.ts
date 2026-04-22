import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { UserStreak } from './entities/user-streak.entity';
import { PracticeSession } from '../practice/entities/practice-session.entity';
import { SessionAnswer } from '../practice/entities/session-answer.entity';
import { Course } from '../courses/entities/course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserStreak,
      PracticeSession,
      SessionAnswer,
      Course,
    ]),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}

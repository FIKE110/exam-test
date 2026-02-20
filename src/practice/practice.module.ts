import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticeSession } from './entities/practice-session.entity';
import { SessionAnswer } from './entities/session-answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PracticeSession, SessionAnswer])],
  controllers: [],
  providers: [],
  exports: [],
})
export class PracticeModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MockExam } from './entities/mock-exam.entity';
import { MockExamSession } from './entities/mock-exam-session.entity';
import { Question } from '../questions/entities/question.entity';
import { MockExamsController } from './mock-exams.controller';
import { MockExamsService } from './mock-exams.service';

@Module({
  imports: [TypeOrmModule.forFeature([MockExam, MockExamSession, Question])],
  controllers: [MockExamsController],
  providers: [MockExamsService],
  exports: [MockExamsService],
})
export class MockExamsModule {}

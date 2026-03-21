import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MockExam } from './entities/mock-exam.entity';
import { MockExamSession } from './entities/mock-exam-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MockExam, MockExamSession])],
  controllers: [],
  providers: [],
  exports: [],
})
export class MockExamsModule {}

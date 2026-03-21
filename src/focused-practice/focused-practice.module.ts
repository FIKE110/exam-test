import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FocusedPracticeController } from './focused-practice.controller';
import { FocusedPracticeService } from './focused-practice.service';
import { Question } from '../questions/entities/question.entity';
import { Course } from '../courses/entities/course.entity';
import { PracticeSession } from '../practice/entities/practice-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Course, PracticeSession])],
  controllers: [FocusedPracticeController],
  providers: [FocusedPracticeService],
  exports: [FocusedPracticeService],
})
export class FocusedPracticeModule {}

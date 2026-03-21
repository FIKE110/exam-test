import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';
import { Milestone, UserMilestone } from './entities/milestone.entity';
import { PerformanceGoal } from './entities/performance-goal.entity';
import { PracticeSession } from '../practice/entities/practice-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Milestone,
      UserMilestone,
      PerformanceGoal,
      PracticeSession,
    ]),
  ],
  controllers: [GoalsController],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {}

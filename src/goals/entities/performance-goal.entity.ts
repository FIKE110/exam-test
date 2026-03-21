import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum GoalType {
  DAILY_QUESTIONS = 'daily_questions',
  WEEKLY_QUESTIONS = 'weekly_questions',
  WEEKLY_STUDY_HOURS = 'weekly_study_hours',
  ACCURACY_TARGET = 'accuracy_target',
  STREAK_DAYS = 'streak_days',
}

export enum GoalPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ONGOING = 'ongoing',
}

@Entity('performance_goals')
@Index(['userId'])
export class PerformanceGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: GoalType,
  })
  goalType: GoalType;

  @Column({
    type: 'enum',
    enum: GoalPeriod,
    default: GoalPeriod.WEEKLY,
  })
  period: GoalPeriod;

  @Column({ type: 'integer' })
  targetValue: number;

  @Column({ type: 'integer', default: 0, name: 'current_value' })
  currentValue: number;

  @Column({ type: 'boolean', default: false, name: 'is_completed' })
  isCompleted: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
  completedAt: Date | null;

  @Column({ type: 'date', name: 'period_start' })
  periodStart: Date;

  @Column({ type: 'date', name: 'period_end' })
  periodEnd: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

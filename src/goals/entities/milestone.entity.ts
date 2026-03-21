import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum MilestoneType {
  QUESTIONS_ANSWERED = 'questions_answered',
  STREAK_DAYS = 'streak_days',
  ACCURACY_TARGET = 'accuracy_target',
  SESSIONS_COMPLETED = 'sessions_completed',
  COURSES_COMPLETED = 'courses_completed',
  WEEKLY_STUDY_HOURS = 'weekly_study_hours',
}

export enum MilestoneRarity {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

@Entity('milestones')
@Index(['type'])
export class Milestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  icon: string;

  @Column({
    type: 'enum',
    enum: MilestoneType,
  })
  type: MilestoneType;

  @Column({ type: 'integer' })
  threshold: number;

  @Column({
    type: 'enum',
    enum: MilestoneRarity,
    default: MilestoneRarity.BRONZE,
  })
  rarity: MilestoneRarity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('user_milestones')
@Index(['userId'])
export class UserMilestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'milestone_id' })
  milestoneId: string;

  @ManyToOne(() => Milestone)
  @JoinColumn({ name: 'milestone_id' })
  milestone: Milestone;

  @Column({ type: 'timestamp', name: 'earned_at' })
  earnedAt: Date;
}

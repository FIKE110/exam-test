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

@Entity('user_streaks')
@Index(['userId'], { unique: true })
@Index(['lastPracticeDate'])
export class UserStreak {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id', unique: true })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'integer', default: 0, name: 'current_streak' })
  currentStreak: number;

  @Column({ type: 'integer', default: 0, name: 'longest_streak' })
  longestStreak: number;

  @Column({ type: 'date', name: 'last_practice_date' })
  lastPracticeDate: Date;

  @Column({ type: 'jsonb', name: 'weekly_activity' })
  weeklyActivity: Array<{ date: string; practiced: boolean }>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import {
  SessionType,
  SessionStatus,
  Difficulty,
} from '../../common/enums/practice.enum';
import { SessionAnswer } from './session-answer.entity';

@Entity('practice_sessions')
@Index(['userId'])
@Index(['courseId'])
@Index(['sessionType'])
@Index(['status'])
export class PracticeSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: SessionType,
    name: 'session_type',
  })
  sessionType: SessionType;

  @Column({ type: 'uuid', name: 'course_id' })
  courseId: string;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({
    type: 'enum',
    enum: Difficulty,
    nullable: true,
  })
  difficulty: Difficulty | null;

  @Column({ type: 'integer', name: 'total_questions' })
  totalQuestions: number;

  @Column({ type: 'integer', default: 0, name: 'total_answered' })
  totalAnswered: number;

  @Column({ type: 'integer', default: 0, name: 'correct_answers' })
  correctAnswers: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    name: 'accuracy_percentage',
  })
  accuracyPercentage: number | null;

  @Column({ type: 'integer', nullable: true, name: 'time_limit_minutes' })
  timeLimitMinutes: number | null;

  @Column({ type: 'integer', default: 0, name: 'time_spent_seconds' })
  timeSpentSeconds: number;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.IN_PROGRESS,
  })
  status: SessionStatus;

  @Column({ type: 'timestamp', name: 'started_at' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => SessionAnswer, (answer) => answer.session)
  answers: SessionAnswer[];

  // Helper method to calculate accuracy
  calculateAccuracy(): number {
    if (this.totalAnswered === 0) return 0;
    return Math.round((this.correctAnswers / this.totalAnswered) * 100);
  }
}

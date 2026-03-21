import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { MockExam } from './mock-exam.entity';

@Entity('mock_exam_sessions')
@Index(['userId'])
export class MockExamSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'mock_exam_id' })
  mockExamId: string;

  @ManyToOne(() => MockExam, (exam) => exam.sessions)
  @JoinColumn({ name: 'mock_exam_id' })
  mockExam: MockExam;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'jsonb', name: 'question_ids' })
  questionIds: string[];

  @Column({ type: 'jsonb', name: 'answers', default: {} })
  answers: Record<string, string>;

  @Column({ type: 'integer', default: 0, name: 'correct_answers' })
  correctAnswers: number;

  @Column({ type: 'integer', default: 0, name: 'total_questions' })
  totalQuestions: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    name: 'score_percentage',
  })
  scorePercentage: number;

  @Column({ type: 'integer', default: 0, name: 'time_spent_seconds' })
  timeSpentSeconds: number;

  @Column({ type: 'integer', name: 'time_limit_seconds' })
  timeLimitSeconds: number;

  @Column({ type: 'boolean', default: false, name: 'is_completed' })
  isCompleted: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_passed' })
  isPassed: boolean;

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
  completedAt: Date | null;
}

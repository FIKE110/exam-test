import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { MockExamSession } from './mock-exam-session.entity';

export enum MockExamDifficulty {
  EASY = 'easy',
  INTERMEDIATE = 'intermediate',
  HARD = 'hard',
}

@Entity('mock_exams')
@Index(['isActive'])
export class MockExam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'image_url' })
  imageUrl: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ type: 'integer', name: 'number_of_questions' })
  numberOfQuestions: number;

  @Column({
    type: 'enum',
    enum: MockExamDifficulty,
    name: 'difficulty',
  })
  difficulty: MockExamDifficulty;

  @Column({ type: 'integer', name: 'time_limit_minutes' })
  timeLimitMinutes: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'integer', default: 0, name: 'times_taken' })
  timesTaken: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    name: 'average_score',
  })
  averageScore: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => MockExamSession, (session) => session.mockExam)
  sessions: MockExamSession[];
}

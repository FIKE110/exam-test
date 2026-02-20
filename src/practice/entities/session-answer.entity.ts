import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { PracticeSession } from './practice-session.entity';
import { Question } from '../../questions/entities/question.entity';

@Entity('session_answers')
@Index(['sessionId'])
@Index(['questionId'])
export class SessionAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'session_id' })
  sessionId: string;

  @ManyToOne(() => PracticeSession, (session) => session.answers)
  @JoinColumn({ name: 'session_id' })
  session: PracticeSession;

  @Column({ type: 'uuid', name: 'question_id' })
  questionId: string;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ type: 'varchar', name: 'selected_answer' })
  selectedAnswer: string;

  @Column({ type: 'boolean', name: 'is_correct' })
  isCorrect: boolean;

  @Column({ type: 'integer', name: 'time_spent_seconds' })
  timeSpentSeconds: number;

  @Column({ type: 'boolean', default: false, name: 'is_flagged' })
  isFlagged: boolean;

  @Column({ type: 'timestamp', name: 'answered_at' })
  answeredAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

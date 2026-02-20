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
import { Course } from '../../courses/entities/course.entity';
import { Difficulty, QuestionType } from '../../common/enums/practice.enum';
import { User } from '../../users/entities/user.entity';

@Entity('questions')
@Index(['courseId'])
@Index(['difficulty'])
@Index(['topic'])
@Index(['isFlagged'])
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'course_id' })
  courseId: string;

  @ManyToOne(() => Course, (course) => course.questions)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ type: 'text', name: 'question_text' })
  questionText: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.SINGLE_CHOICE,
    name: 'question_type',
  })
  questionType: QuestionType;

  @Column({ type: 'jsonb' })
  options: Array<{ id: string; text: string }>;

  @Column({ type: 'varchar', name: 'correct_answer' })
  correctAnswer: string;

  @Column({ type: 'text' })
  explanation: string;

  @Column({
    type: 'enum',
    enum: Difficulty,
  })
  difficulty: Difficulty;

  @Column({ type: 'varchar', length: 100 })
  topic: string;

  @Column({ type: 'boolean', default: false, name: 'is_flagged' })
  isFlagged: boolean;

  @Column({ type: 'text', nullable: true, name: 'flag_reason' })
  flagReason: string | null;

  @Column({ type: 'uuid', name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

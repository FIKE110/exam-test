import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Difficulty } from '../../common/enums/practice.enum';
import { Question } from '../../questions/entities/question.entity';

export enum CourseCategory {
  MEDICAL = 'medical',
  TECHNOLOGY = 'technology',
  BUSINESS = 'business',
  LAW = 'law',
  ACCOUNTING = 'accounting',
  ENGINEERING = 'engineering',
  GENERAL = 'general',
}

@Entity('courses')
@Index(['slug'], { unique: true })
@Index(['category'])
@Index(['isActive'])
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: CourseCategory,
  })
  category: CourseCategory;

  @Column({ type: 'integer', default: 0, name: 'total_duration_minutes' })
  totalDurationMinutes: number;

  @Column({
    type: 'enum',
    enum: Difficulty,
    name: 'difficulty_level',
  })
  difficultyLevel: Difficulty;

  @Column({ type: 'integer', default: 0, name: 'total_questions' })
  totalQuestions: number;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'thumbnail_url',
  })
  thumbnailUrl: string | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Question, (question) => question.course)
  questions: Question[];
}

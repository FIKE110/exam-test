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

@Entity('study_materials')
@Index(['courseId'])
export class StudyMaterial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'course_id' })
  courseId: string;

  @ManyToOne(() => Course, (course) => course.studyMaterials)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  link: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'cover_image_url',
  })
  coverImageUrl: string;

  @Column({ type: 'integer', default: 0, name: 'thumbs_up_count' })
  thumbsUpCount: number;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
    name: 'average_rating',
  })
  averageRating: number;

  @Column({ type: 'integer', default: 0, name: 'rating_count' })
  ratingCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum NotificationTag {
  ADMIN = 'admin',
  SYSTEM = 'system',
  USER = 'user',
  COURSE = 'course',
  EXAM = 'exam',
  PROGRESS = 'progress',
  SUBSCRIPTION = 'subscription',
  GENERAL = 'general',
}

@Entity('notifications')
@Index(['userId'])
@Index(['tag'])
@Index(['isRead'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationTag,
    default: NotificationTag.GENERAL,
  })
  tag: NotificationTag;

  @Column({ type: 'boolean', default: false, name: 'is_read' })
  isRead: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'action_url' })
  actionUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

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
import { DiscussionPost } from './discussion-post.entity';

@Entity('discussion_answers')
@Index(['postId'])
@Index(['userId'])
export class DiscussionAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'post_id' })
  postId: string;

  @ManyToOne(() => DiscussionPost, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: DiscussionPost;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'integer', default: 0 })
  upvotes: number;

  @Column({ type: 'boolean', default: false, name: 'is_accepted' })
  isAccepted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

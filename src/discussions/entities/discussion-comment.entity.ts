import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { DiscussionPost } from './discussion-post.entity';
import { DiscussionAnswer } from './discussion-answer.entity';

@Entity('discussion_comments')
@Index(['postId'])
@Index(['answerId'])
@Index(['userId'])
export class DiscussionComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'post_id' })
  postId: string | null;

  @ManyToOne(() => DiscussionPost, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: DiscussionPost | null;

  @Column({ type: 'uuid', nullable: true, name: 'answer_id' })
  answerId: string | null;

  @ManyToOne(() => DiscussionAnswer, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'answer_id' })
  answer: DiscussionAnswer | null;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

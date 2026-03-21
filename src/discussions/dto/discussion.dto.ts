import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'Post title',
    example: 'How to prepare for PLAB 2 exam?',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    description: 'Post content/body',
    example: 'I have been preparing for PLAB 2 for 3 months...',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({
    description: 'Course ID to link this post to',
    example: 'uuid',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional({
    description: 'Tags for the post',
    example: ['plab', 'exam-prep'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdatePostDto {
  @ApiPropertyOptional({ description: 'Post title', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ description: 'Post content/body' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Tags for the post', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class CreateAnswerDto {
  @ApiProperty({
    description: 'Answer content',
    example: 'Here is what worked for me...',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class UpdateAnswerDto {
  @ApiProperty({ description: 'Answer content' })
  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment content',
    example: 'Great answer! Could you elaborate on...',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class AuthorDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User full name' })
  name: string;

  @ApiPropertyOptional({ description: 'User avatar URL' })
  avatarUrl: string | null;
}

export class PostListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ type: AuthorDto })
  author: AuthorDto;

  @ApiPropertyOptional()
  course: { id: string; title: string } | null;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  views: number;

  @ApiProperty()
  upvotes: number;

  @ApiProperty()
  isAnswered: boolean;

  @ApiProperty()
  answerCount: number;

  @ApiProperty()
  createdAt: Date;
}

export class CommentDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: AuthorDto })
  author: AuthorDto;

  @ApiProperty()
  content: string;

  @ApiProperty()
  createdAt: Date;
}

export class AnswerDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: AuthorDto })
  author: AuthorDto;

  @ApiProperty()
  content: string;

  @ApiProperty()
  upvotes: number;

  @ApiProperty()
  isAccepted: boolean;

  @ApiProperty({ type: [CommentDto] })
  comments: CommentDto[];

  @ApiProperty()
  createdAt: Date;
}

export class PostDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ type: AuthorDto })
  author: AuthorDto;

  @ApiPropertyOptional()
  course: { id: string; title: string } | null;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  views: number;

  @ApiProperty()
  upvotes: number;

  @ApiProperty()
  isAnswered: boolean;

  @ApiProperty({ type: [AnswerDto] })
  answers: AnswerDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscussionPost } from './entities/discussion-post.entity';
import { DiscussionAnswer } from './entities/discussion-answer.entity';
import { DiscussionComment } from './entities/discussion-comment.entity';
import {
  CreatePostDto,
  UpdatePostDto,
  CreateAnswerDto,
  UpdateAnswerDto,
  CreateCommentDto,
  PostDetailDto,
} from './dto/discussion.dto';

@Injectable()
export class DiscussionsService {
  constructor(
    @InjectRepository(DiscussionPost)
    private postRepository: Repository<DiscussionPost>,
    @InjectRepository(DiscussionAnswer)
    private answerRepository: Repository<DiscussionAnswer>,
    @InjectRepository(DiscussionComment)
    private commentRepository: Repository<DiscussionComment>,
  ) {}

  async getPosts(
    page = 1,
    limit = 20,
    courseId?: string,
    tag?: string,
    search?: string,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
  ) {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.course', 'course')
      .select([
        'post.id',
        'post.title',
        'post.content',
        'post.tags',
        'post.views',
        'post.upvotes',
        'post.isAnswered',
        'post.createdAt',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.avatarUrl',
        'course.id',
        'course.title',
      ]);

    if (courseId) {
      queryBuilder.andWhere('post.courseId = :courseId', { courseId });
    }

    if (tag) {
      queryBuilder.andWhere(':tag = ANY(post.tags)', { tag });
    }

    if (search) {
      queryBuilder.andWhere(
        '(post.title ILIKE :search OR post.content ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const allowedSortFields = ['createdAt', 'title', 'views', 'upvotes'];
    const orderField = sortBy && allowedSortFields.includes(sortBy) ? `post.${sortBy}` : 'post.createdAt';
    const orderDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const [posts, total] = await queryBuilder
      .orderBy(orderField, orderDirection)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const postIds = posts.map((p) => p.id);
    const answerCountsMap = new Map<string, number>();

    if (postIds.length > 0) {
      const counts = await this.answerRepository
        .createQueryBuilder('answer')
        .select('answer.post_id', 'postId')
        .addSelect('COUNT(*)', 'count')
        .where('answer.post_id IN (:...postIds)', { postIds })
        .groupBy('answer.post_id')
        .getRawMany<{ postId: string; count: string }>();

      for (const row of counts) {
        answerCountsMap.set(row.postId, parseInt(row.count, 10));
      }
    }

    const data = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content:
        post.content.length > 200
          ? post.content.substring(0, 200) + '...'
          : post.content,
      author: {
        id: post.user.id,
        name: `${post.user.firstName} ${post.user.lastName}`,
        avatarUrl: post.user.avatarUrl,
      },
      course: post.course
        ? { id: post.course.id, title: post.course.title }
        : null,
      tags: post.tags,
      views: post.views,
      upvotes: post.upvotes,
      isAnswered: post.isAnswered,
      answerCount: answerCountsMap.get(post.id) || 0,
      createdAt: post.createdAt,
    }));

    return {
      status: true,
      data,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getPostById(postId: string) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['user', 'course'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.postRepository.increment({ id: postId }, 'views', 1);

    const answers = await this.answerRepository.find({
      where: { postId },
      relations: ['user'],
      order: { isAccepted: 'DESC', upvotes: 'DESC', createdAt: 'ASC' },
    });

    const answersWithComments = await Promise.all(
      answers.map(async (answer) => {
        const comments = await this.commentRepository.find({
          where: { answerId: answer.id },
          relations: ['user'],
          order: { createdAt: 'ASC' },
        });
        return {
          id: answer.id,
          author: {
            id: answer.user.id,
            name: `${answer.user.firstName} ${answer.user.lastName}`,
            avatarUrl: answer.user.avatarUrl,
          },
          content: answer.content,
          upvotes: answer.upvotes,
          isAccepted: answer.isAccepted,
          comments: comments.map((c) => ({
            id: c.id,
            author: {
              id: c.user.id,
              name: `${c.user.firstName} ${c.user.lastName}`,
              avatarUrl: c.user.avatarUrl,
            },
            content: c.content,
            createdAt: c.createdAt,
          })),
          createdAt: answer.createdAt,
        };
      }),
    );

    return {
      status: true,
      data: {
        id: post.id,
        title: post.title,
        content: post.content,
        author: {
          id: post.user.id,
          name: `${post.user.firstName} ${post.user.lastName}`,
          avatarUrl: post.user.avatarUrl,
        },
        course: post.course
          ? { id: post.course.id, title: post.course.title }
          : null,
        tags: post.tags,
        views: post.views + 1,
        upvotes: post.upvotes,
        isAnswered: post.isAnswered,
        answers: answersWithComments,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    };
  }

  async createPost(userId: string, dto: CreatePostDto) {
    const post = this.postRepository.create({
      userId,
      courseId: dto.courseId || null,
      title: dto.title,
      content: dto.content,
      tags: dto.tags || [],
    });

    await this.postRepository.save(post);

    return {
      status: true,
      data: {
        id: post.id,
        title: post.title,
        content: post.content,
        tags: post.tags,
        createdAt: post.createdAt,
      },
    };
  }

  async updatePost(userId: string, postId: string, dto: UpdatePostDto) {
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    if (dto.title) post.title = dto.title;
    if (dto.content) post.content = dto.content;
    if (dto.tags) post.tags = dto.tags;

    await this.postRepository.save(post);

    return {
      status: true,
      data: {
        id: post.id,
        title: post.title,
        content: post.content,
        tags: post.tags,
        updatedAt: post.updatedAt,
      },
    };
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postRepository.remove(post);

    return { status: true, data: null };
  }

  async createAnswer(userId: string, postId: string, dto: CreateAnswerDto) {
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const answer = this.answerRepository.create({
      postId,
      userId,
      content: dto.content,
    });

    await this.answerRepository.save(answer);

    return {
      status: true,
      data: {
        id: answer.id,
        content: answer.content,
        upvotes: 0,
        isAccepted: false,
        comments: [],
        createdAt: answer.createdAt,
      },
    };
  }

  async updateAnswer(
    userId: string,
    postId: string,
    answerId: string,
    dto: UpdateAnswerDto,
  ) {
    const answer = await this.answerRepository.findOne({
      where: { id: answerId, postId },
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    if (answer.userId !== userId) {
      throw new ForbiddenException('You can only edit your own answers');
    }

    answer.content = dto.content;
    await this.answerRepository.save(answer);

    return {
      status: true,
      data: {
        id: answer.id,
        content: answer.content,
        updatedAt: answer.updatedAt,
      },
    };
  }

  async deleteAnswer(userId: string, postId: string, answerId: string) {
    const answer = await this.answerRepository.findOne({
      where: { id: answerId, postId },
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    if (answer.userId !== userId) {
      throw new ForbiddenException('You can only delete your own answers');
    }

    await this.answerRepository.remove(answer);

    return { status: true, data: null };
  }

  async acceptAnswer(userId: string, postId: string, answerId: string) {
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('Only the post author can accept answers');
    }

    await this.answerRepository.update({ postId }, { isAccepted: false });

    const answer = await this.answerRepository.findOne({
      where: { id: answerId, postId },
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    answer.isAccepted = true;
    await this.answerRepository.save(answer);

    post.isAnswered = true;
    await this.postRepository.save(post);

    return {
      status: true,
      data: {
        answerId: answer.id,
        isAccepted: true,
      },
    };
  }

  async createCommentOnPost(
    userId: string,
    postId: string,
    dto: CreateCommentDto,
  ) {
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = this.commentRepository.create({
      postId,
      userId,
      content: dto.content,
    });

    await this.commentRepository.save(comment);

    return {
      status: true,
      data: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
      },
    };
  }

  async createCommentOnAnswer(
    userId: string,
    answerId: string,
    dto: CreateCommentDto,
  ) {
    const answer = await this.answerRepository.findOne({
      where: { id: answerId },
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    const comment = this.commentRepository.create({
      answerId,
      userId,
      content: dto.content,
    });

    await this.commentRepository.save(comment);

    return {
      status: true,
      data: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
      },
    };
  }

  async upvotePost(userId: string, postId: string) {
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.postRepository.increment({ id: postId }, 'upvotes', 1);

    return {
      status: true,
      data: {
        upvotes: post.upvotes + 1,
      },
    };
  }

  async upvoteAnswer(userId: string, answerId: string) {
    const answer = await this.answerRepository.findOne({
      where: { id: answerId },
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    await this.answerRepository.increment({ id: answerId }, 'upvotes', 1);

    return {
      status: true,
      data: {
        upvotes: answer.upvotes + 1,
      },
    };
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import {
  SubscriptionStatus,
  SubscriptionTier,
} from '../common/enums/subscription.enum';

export interface UserListQuery {
  page: number;
  limit: number;
  search?: string;
  status?: 'active' | 'suspended';
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  plan: string;
  createdAt: Date;
}

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUsers(query: UserListQuery) {
    const { page, limit, search, status } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.isAdmin',
        'user.subscriptionStatus',
        'user.subscriptionTier',
        'user.createdAt',
      ]);

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(user.firstName) LIKE LOWER(:search) OR LOWER(user.lastName) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    if (status) {
      const isActive = status === 'active';
      queryBuilder.andWhere('user.subscriptionStatus = :status', {
        status: isActive
          ? SubscriptionStatus.ACTIVE
          : SubscriptionStatus.SUSPENDED,
      });
    }

    const [users, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    const data: UserListItem[] = users.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.isAdmin ? 'Admin' : 'User',
      status:
        user.subscriptionStatus === SubscriptionStatus.ACTIVE
          ? 'Active'
          : 'Suspended',
      plan:
        user.subscriptionTier === SubscriptionTier.FREE ? 'Started' : 'Paid',
      createdAt: user.createdAt,
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

  async updateUserStatus(userId: string, status: 'active' | 'suspended') {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      return {
        status: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      };
    }

    user.subscriptionStatus =
      status === 'active'
        ? SubscriptionStatus.ACTIVE
        : SubscriptionStatus.SUSPENDED;

    await this.userRepository.save(user);

    return {
      status: true,
      data: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        status:
          user.subscriptionStatus === SubscriptionStatus.ACTIVE
            ? 'Active'
            : 'Suspended',
      },
    };
  }
}

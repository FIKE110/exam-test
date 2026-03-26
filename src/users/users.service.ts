import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async getProfile(userId: string) {
    const user = await this.findById(userId);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      profession: user.profession,
      avatarUrl: user.avatarUrl,
      examTypes: user.examTypes,
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.findById(userId);

    if (updateProfileDto.fullName) {
      const nameParts = updateProfileDto.fullName.trim().split(/\s+/);
      user.firstName = nameParts[0] || '';
      user.lastName = nameParts.slice(1).join(' ') || '';
    }

    if (updateProfileDto.phone !== undefined) {
      user.phone = updateProfileDto.phone;
    }

    if (updateProfileDto.dateOfBirth !== undefined) {
      user.dateOfBirth = updateProfileDto.dateOfBirth
        ? new Date(updateProfileDto.dateOfBirth)
        : null;
    }

    if (updateProfileDto.profession !== undefined) {
      user.profession = updateProfileDto.profession;
    }

    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      profession: user.profession,
      avatarUrl: user.avatarUrl,
      examTypes: user.examTypes,
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getUserStats(userId: string) {
    // TODO: Implement stats aggregation from various tables
    return {
      totalQuestionsAnswered: 0,
      overallAccuracy: 0,
      totalStudyHours: 0,
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  // Admin methods
  async findAll(options: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where(
        '(user.email ILIKE :search OR user.first_name ILIKE :search OR user.last_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [users, total] = await queryBuilder
      .orderBy('user.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async updateAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
    const user = await this.findById(userId);
    user.avatarUrl = avatarUrl;
    await this.userRepository.save(user);
  }

  async updateSubscription(
    userId: string,
    subscriptionTier: string,
    subscriptionStatus: string,
  ) {
    const user = await this.findById(userId);

    user.subscriptionTier = subscriptionTier as any;
    user.subscriptionStatus = subscriptionStatus as any;

    if (subscriptionTier === 'premium' && subscriptionStatus === 'active') {
      // Set expiration to 30 days from now
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      user.subscriptionExpiresAt = expiryDate;
    }

    await this.userRepository.save(user);

    return {
      id: user.id,
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
    };
  }
}

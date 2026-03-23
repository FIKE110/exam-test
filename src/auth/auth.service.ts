import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Admin } from '../admin/entities/admin.entity';
import { UserStreak } from '../progress/entities/user-streak.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthTokens, AuthResponse } from './interfaces/auth.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY_SHORT = '7d';
  private readonly REFRESH_TOKEN_EXPIRY_LONG = '30d';

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(UserStreak)
    private userStreakRepository: Repository<UserStreak>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const {
      email,
      password,
      fullName,
      phone,
      dateOfBirth,
      profession,
      examType,
    } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const user = this.userRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      dateOfBirth: new Date(dateOfBirth),
      profession,
      examTypes: [examType],
    });

    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user, false, 'user');

    return {
      role: 'user',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        profession: user.profession,
        examTypes: user.examTypes,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
      },
      tokens,
    };
  }

  async login(loginDto: LoginDto, rememberMe = false): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Try user first
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (isPasswordValid) {
        const tokens = await this.generateTokens(user, rememberMe, 'user');
        return {
          role: 'user',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
            phone: user.phone,
            dateOfBirth: user.dateOfBirth,
            profession: user.profession,
            examTypes: user.examTypes,
            subscriptionTier: user.subscriptionTier,
            subscriptionStatus: user.subscriptionStatus,
            subscriptionExpiresAt: user.subscriptionExpiresAt,
          },
          tokens,
        };
      }
    }

    // Try admin
    const admin = await this.adminRepository.findOne({
      where: { email },
    });

    if (admin) {
      const isPasswordValid = await bcrypt.compare(
        password,
        admin.passwordHash,
      );

      if (isPasswordValid && admin.isActive) {
        const tokens = await this.generateTokens(admin, rememberMe, 'admin');
        return {
          role: 'admin',
          admin: {
            id: admin.id,
            email: admin.email,
            username: admin.username,
            role: admin.role,
          },
          tokens,
        };
      }
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async refreshTokens(
    refreshToken: string,
    rememberMe = false,
  ): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      });

      if (payload.accountType === 'admin') {
        const admin = await this.adminRepository.findOne({
          where: { id: payload.sub },
        });

        if (!admin || !admin.isActive) {
          throw new UnauthorizedException('Invalid refresh token');
        }

        return this.generateTokens(admin, rememberMe, 'admin');
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user, rememberMe, 'user');
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    // Note: Access tokens remain valid until expiry (15 min).
    // For full invalidation, implement a token blacklist with Redis.
    await Promise.resolve();
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const streak = await this.userStreakRepository.findOne({
      where: { userId },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      profession: user.profession,
      examTypes: user.examTypes,
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
    };
  }

  private async generateTokens(
    account: User | Admin,
    rememberMe: boolean,
    accountType: 'user' | 'admin',
  ): Promise<AuthTokens> {
    const payload = {
      sub: account.id,
      email: account.email,
      role: (account as any).role || 'user',
      accountType,
      rememberMe,
    };

    const refreshTokenExpiry = rememberMe
      ? this.REFRESH_TOKEN_EXPIRY_LONG
      : this.REFRESH_TOKEN_EXPIRY_SHORT;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: refreshTokenExpiry,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}

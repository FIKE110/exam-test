import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { EmailService } from '../emails/services/email.service';

@Injectable()
export class AuthPasswordService {
  constructor(
    @InjectRepository(PasswordResetToken)
    private tokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      return {
        status: true,
        data: {
          message:
            'If an account exists with this email, a password reset link will be sent.',
        },
      };
    }

    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.tokenRepository.delete({ userId: user.id });

    const resetToken = this.tokenRepository.create({
      userId: user.id,
      token,
      expiresAt,
    });

    await this.tokenRepository.save(resetToken);

    const frontendUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await this.emailService.sendPasswordResetEmail(user.email, resetLink);

    return {
      status: true,
      data: {
        message:
          'If an account exists with this email, a password reset link will be sent.',
      },
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const resetToken = await this.tokenRepository.findOne({
      where: { token: dto.token },
      relations: ['user'],
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (resetToken.usedAt) {
      throw new BadRequestException('This reset token has already been used');
    }

    if (new Date() > resetToken.expiresAt) {
      throw new BadRequestException('This reset token has expired');
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(dto.newPassword, saltRounds);

    resetToken.user.passwordHash = passwordHash;
    resetToken.usedAt = new Date();

    await this.userRepository.save(resetToken.user);
    await this.tokenRepository.save(resetToken);

    return {
      status: true,
      data: {
        message: 'Password has been reset successfully.',
      },
    };
  }

  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

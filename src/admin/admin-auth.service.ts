import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin, AdminRole } from './entities/admin.entity';
import { AdminLoginDto, AdminRegisterDto } from './dto/admin-auth.dto';
import { ConfigService } from '@nestjs/config';

export interface AdminTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AdminAuthResponse {
  admin: {
    id: string;
    email: string;
    username: string;
    role: AdminRole;
  };
  tokens: AdminTokens;
}

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: AdminRegisterDto): Promise<AdminAuthResponse> {
    const { email, username, password } = registerDto;

    const existingEmail = await this.adminRepository.findOne({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('Email is already registered');
    }

    const existingUsername = await this.adminRepository.findOne({
      where: { username },
    });
    if (existingUsername) {
      throw new ConflictException('Username is already taken');
    }

    const saltRounds = 12;
    const passwordHash = (await bcrypt.hash(password, saltRounds)) as string;

    const admin = this.adminRepository.create({
      email,
      username,
      passwordHash,
      role: AdminRole.CONTENT_ADMIN,
    });

    await this.adminRepository.save(admin);

    const tokens = await this.generateTokens(admin);

    return {
      admin: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
      },
      tokens,
    };
  }

  async login(loginDto: AdminLoginDto): Promise<AdminAuthResponse> {
    const { email, password } = loginDto;

    const admin = await this.adminRepository.findOne({
      where: { email },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Admin account is deactivated');
    }

    const isPasswordValid = (await bcrypt.compare(
      password,
      admin.passwordHash,
    )) as boolean;

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(admin);

    return {
      admin: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
      },
      tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AdminTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get(
          'JWT_REFRESH_SECRET',
          'refresh-secret-key',
        ),
      }) as { sub: string; email: string; role: AdminRole };

      const admin = await this.adminRepository.findOne({
        where: { id: payload.sub },
      });

      if (!admin || !admin.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(admin);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateAdmin(adminId: string): Promise<Admin | null> {
    return this.adminRepository.findOne({
      where: { id: adminId, isActive: true },
    });
  }

  private async generateTokens(admin: Admin): Promise<AdminTokens> {
    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET', 'your-secret-key'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get(
          'JWT_REFRESH_SECRET',
          'refresh-secret-key',
        ),
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}

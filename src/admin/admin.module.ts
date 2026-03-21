import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminAuthService } from './admin-auth.service';
import {
  AdminAuthController,
  AdminDashboardController,
  AdminUsersController,
  AdminQuestionsController,
  AdminSettingsController,
} from './admin.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminQuestionsService } from './admin-questions.service';
import { AdminSettingsService } from './admin-settings.service';
import { Admin } from './entities/admin.entity';
import { PlatformSettings } from './entities/platform-settings.entity';
import { User } from '../users/entities/user.entity';
import { Question } from '../questions/entities/question.entity';
import { Course } from '../courses/entities/course.entity';
import { PracticeSession } from '../practice/entities/practice-session.entity';
import { DiscussionPost } from '../discussions/entities/discussion-post.entity';
import { DiscussionAnswer } from '../discussions/entities/discussion-answer.entity';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      User,
      Question,
      Course,
      PracticeSession,
      DiscussionPost,
      DiscussionAnswer,
      PlatformSettings,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'your-secret-key'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AdminAuthController,
    AdminDashboardController,
    AdminUsersController,
    AdminQuestionsController,
    AdminSettingsController,
  ],
  providers: [
    AdminAuthService,
    AdminUsersService,
    AdminDashboardService,
    AdminQuestionsService,
    AdminSettingsService,
    JwtStrategy,
  ],
  exports: [AdminAuthService],
})
export class AdminModule {}

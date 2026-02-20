import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { UserCourseProgress } from '../courses/entities/user-course-progress.entity';
import { Question } from '../questions/entities/question.entity';
import { PracticeSession } from '../practice/entities/practice-session.entity';
import { SessionAnswer } from '../practice/entities/session-answer.entity';
import { UserStreak } from '../progress/entities/user-streak.entity';
import { AIChatSession } from '../ai/entities/ai-chat-session.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        
        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get('DB_PORT', 5432),
          username: configService.get('DB_USERNAME', 'postgres'),
          password: configService.get('DB_PASSWORD', 'password'),
          database: configService.get('DB_NAME', 'exam'),
          entities: [
            User,
            Course,
            UserCourseProgress,
            Question,
            PracticeSession,
            SessionAnswer,
            UserStreak,
            AIChatSession,
          ],
          synchronize: false, // Use db/schema.sql instead to manage schema changes
          logging: configService.get('NODE_ENV') === 'development',
          ssl: isProduction ? { rejectUnauthorized: false } : false,
          extra: isProduction ? {
            max: 5, // Maximum pool size for serverless
            connectionTimeoutMillis: 10000,
            idleTimeoutMillis: 30000,
          } : {},
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

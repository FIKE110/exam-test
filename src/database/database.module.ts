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
        // postgresql://:@/neondb?sslmode=require&channel_binding=require'
        
        return {
          type: 'postgres',
          url: 'postgresql://neondb_owner:npg_SYI1KVxCg2Dm@ep-royal-leaf-aip15rm7.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
          // host: configService.get('DB_HOST', 'ep-royal-leaf-aip15rm7-pooler.c-4.us-east-1.aws.neon.tech'),
          // port: configService.get('DB_PORT', 5432),
          // username: configService.get('DB_USERNAME', 'neondb_owner'),
          // password: configService.get('DB_PASSWORD', 'npg_SYI1KVxCg2Dm'),
          // database: configService.get('DB_NAME', 'neondb'),
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

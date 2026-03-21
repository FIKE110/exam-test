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
import { Profession } from '../domain/entities/profession.entity';
import { Sector } from '../domain/entities/sector.entity';
import { ExamType } from '../domain/entities/exam-type.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        const databaseUrl = configService.get('DATABASE_URL');
        const dbHost = configService.get('DB_HOST', 'localhost');
        const isLocalDb = dbHost === 'localhost' || dbHost === '127.0.0.1';

        const dbConfig: Record<string, unknown> = {
          type: 'postgres',
          entities: [
            User,
            Course,
            UserCourseProgress,
            Question,
            PracticeSession,
            SessionAnswer,
            UserStreak,
            AIChatSession,
            Profession,
            Sector,
            ExamType,
          ],
          synchronize: true,
          logging: configService.get('NODE_ENV') === 'development',
        };

        if (databaseUrl) {
          Object.assign(dbConfig, { url: databaseUrl });
          if (isProduction || !isLocalDb) {
            dbConfig.extra = { ssl: { rejectUnauthorized: false } };
          }
        } else {
          Object.assign(dbConfig, {
            host: dbHost,
            port: configService.get<number>('DB_PORT', 5432),
            username: configService.get('DB_USERNAME', 'postgres'),
            password: configService.get('DB_PASSWORD', 'password'),
            database: configService.get('DB_NAME', 'exam'),
          });
        }

        if (isProduction) {
          dbConfig.extra = {
            max: 5,
            connectionTimeoutMillis: 10000,
            idleTimeoutMillis: 30000,
            ssl: { rejectUnauthorized: false },
          };
        }

        return dbConfig;
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

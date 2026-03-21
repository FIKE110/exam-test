import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UserSearchHistory } from '../users/entities/user-search-history.entity';
import { Course } from '../courses/entities/course.entity';
import { UserCourseProgress } from '../courses/entities/user-course-progress.entity';
import { Question } from '../questions/entities/question.entity';
import { PracticeSession } from '../practice/entities/practice-session.entity';
import { SessionAnswer } from '../practice/entities/session-answer.entity';
import { UserStreak } from '../progress/entities/user-streak.entity';
import { Profession } from '../domain/entities/profession.entity';
import { Sector } from '../domain/entities/sector.entity';
import { ExamType } from '../domain/entities/exam-type.entity';
import { StudyMaterial } from '../study-materials/entities/study-material.entity';
import { Event } from '../events/entities/event.entity';
import { EventRegistration } from '../events/entities/event-registration.entity';
import { AIChatSession } from '../ai-chat/entities/ai-chat-session.entity';
import { MockExam } from '../mock-exams/entities/mock-exam.entity';
import { MockExamSession } from '../mock-exams/entities/mock-exam-session.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { DiscussionPost } from '../discussions/entities/discussion-post.entity';
import { DiscussionAnswer } from '../discussions/entities/discussion-answer.entity';
import { DiscussionComment } from '../discussions/entities/discussion-comment.entity';
import { PasswordResetToken } from '../discussions/entities/password-reset-token.entity';
import { Milestone, UserMilestone } from '../goals/entities/milestone.entity';
import { PerformanceGoal } from '../goals/entities/performance-goal.entity';
import { PlatformSettings } from '../admin/entities/platform-settings.entity';

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
            UserSearchHistory,
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
            StudyMaterial,
            Event,
            EventRegistration,
            MockExam,
            MockExamSession,
            Notification,
            Subscription,
            DiscussionPost,
            DiscussionAnswer,
            DiscussionComment,
            PasswordResetToken,
            Milestone,
            UserMilestone,
            PerformanceGoal,
            PlatformSettings,
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

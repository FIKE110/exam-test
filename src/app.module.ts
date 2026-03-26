import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { QuestionsModule } from './questions/questions.module';
import { PracticeModule } from './practice/practice.module';
import { ProgressModule } from './progress/progress.module';
import { AdminModule } from './admin/admin.module';
import { DomainModule } from './domain/domain.module';
import { FocusedPracticeModule } from './focused-practice/focused-practice.module';
import { StudyMaterialsModule } from './study-materials/study-materials.module';
import { EventsModule } from './events/events.module';
import { AiChatModule } from './ai-chat/ai-chat.module';
import { MockExamsModule } from './mock-exams/mock-exams.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { CodesModule } from './codes/codes.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    QuestionsModule,
    PracticeModule,
    ProgressModule,
    AdminModule,
    DomainModule,
    FocusedPracticeModule,
    StudyMaterialsModule,
    EventsModule,
    AiChatModule,
    MockExamsModule,
    NotificationsModule,
    SubscriptionsModule,
    DiscussionsModule,
    CodesModule,
    UploadModule,
  ],
})
export class AppModule {}

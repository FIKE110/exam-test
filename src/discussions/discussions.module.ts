import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscussionsService } from './discussions.service';
import {
  DiscussionsController,
  AuthPasswordController,
} from './discussions.controller';
import { AuthPasswordService } from './auth-password.service';
import { DiscussionPost } from './entities/discussion-post.entity';
import { DiscussionAnswer } from './entities/discussion-answer.entity';
import { DiscussionComment } from './entities/discussion-comment.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { User } from '../users/entities/user.entity';
import { EmailsModule } from '../emails/emails.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DiscussionPost,
      DiscussionAnswer,
      DiscussionComment,
      PasswordResetToken,
      User,
    ]),
    EmailsModule,
  ],
  controllers: [DiscussionsController, AuthPasswordController],
  providers: [DiscussionsService, AuthPasswordService],
  exports: [DiscussionsService],
})
export class DiscussionsModule {}

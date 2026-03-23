import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Question } from '../questions/entities/question.entity';
import { PracticeSession } from '../practice/entities/practice-session.entity';
import { Course } from '../courses/entities/course.entity';
import { DiscussionPost } from '../discussions/entities/discussion-post.entity';
import { DiscussionAnswer } from '../discussions/entities/discussion-answer.entity';
import { SubscriptionTier } from '../common/enums/subscription.enum';
import { SessionStatus } from '../common/enums/practice.enum';

export interface DashboardMetrics {
  totalQuestions: number;
  registeredUsers: number;
  premiumUsers: number;
  averageScore: number;
  totalPracticeSessions: number;
  totalDiscussions: number;
  totalAnswers: number;
  activeCourses: number;
  weeklyNewUsers: number;
  weeklyNewQuestions: number;
  topSubjects: { name: string; accuracy: number; questionsAnswered: number }[];
  recentActivity: { type: string; description: string; timestamp: Date }[];
}

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(PracticeSession)
    private practiceSessionRepository: Repository<PracticeSession>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(DiscussionPost)
    private discussionPostRepository: Repository<DiscussionPost>,
    @InjectRepository(DiscussionAnswer)
    private discussionAnswerRepository: Repository<DiscussionAnswer>,
  ) {}

  async getMetrics(): Promise<DashboardMetrics> {
    const [
      totalQuestions,
      registeredUsers,
      premiumUsers,
      totalPracticeSessions,
      activeCourses,
      totalDiscussions,
      totalAnswers,
      weeklyNewUsers,
      weeklyNewQuestions,
      sessions,
      recentDiscussions,
    ] = await Promise.all([
      this.questionRepository.count(),
      this.userRepository.count(),
      this.userRepository.count({
        where: { subscriptionTier: SubscriptionTier.PREMIUM },
      }),
      this.practiceSessionRepository.count(),
      this.courseRepository.count({ where: { isActive: true } }),
      this.discussionPostRepository.count(),
      this.discussionAnswerRepository.count(),
      this.getWeeklyNewUsers(),
      this.getWeeklyNewQuestions(),
      this.practiceSessionRepository.find({
        where: { status: SessionStatus.COMPLETED },
        order: { completedAt: 'DESC' },
        take: 100,
      }),
      this.discussionPostRepository.find({
        order: { createdAt: 'DESC' },
        take: 10,
      }),
    ]);

    const averageScore = this.calculateAverageScore(sessions);
    const topSubjects = this.calculateTopSubjects(sessions);

    return {
      totalQuestions,
      registeredUsers,
      premiumUsers,
      averageScore,
      totalPracticeSessions,
      totalDiscussions,
      totalAnswers,
      activeCourses,
      weeklyNewUsers,
      weeklyNewQuestions,
      topSubjects,
      recentActivity: this.formatRecentActivity(recentDiscussions, sessions),
    };
  }

  private async getWeeklyNewUsers(): Promise<number> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :weekAgo', { weekAgo })
      .getCount();
  }

  private async getWeeklyNewQuestions(): Promise<number> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return this.questionRepository
      .createQueryBuilder('question')
      .where('question.createdAt >= :weekAgo', { weekAgo })
      .getCount();
  }

  private calculateAverageScore(sessions: PracticeSession[]): number {
    if (sessions.length === 0) return 0;

    const totalAccuracy = sessions.reduce(
      (sum, s) => sum + (s.accuracyPercentage || 0),
      0,
    );
    return Math.round((totalAccuracy / sessions.length) * 10) / 10;
  }

  private calculateTopSubjects(
    sessions: PracticeSession[],
  ): { name: string; accuracy: number; questionsAnswered: number }[] {
    const subjectMap = new Map<
      string,
      { total: number; correct: number; count: number }
    >();

    sessions.forEach((session) => {
      if (session.courseId) {
        const existing = subjectMap.get(session.courseId) || {
          total: 0,
          correct: 0,
          count: 0,
        };
        existing.total += session.totalAnswered || 0;
        existing.correct += session.correctAnswers || 0;
        existing.count += 1;
        subjectMap.set(session.courseId, existing);
      }
    });

    return Array.from(subjectMap.entries())
      .slice(0, 5)
      .map(([courseId, data]) => ({
        name: courseId.substring(0, 8),
        accuracy:
          data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
        questionsAnswered: data.total,
      }));
  }

  private formatRecentActivity(
    discussions: DiscussionPost[],
    sessions: PracticeSession[],
  ): { type: string; description: string; timestamp: Date }[] {
    const activities: { type: string; description: string; timestamp: Date }[] =
      [];

    discussions.forEach((d) => {
      activities.push({
        type: 'discussion',
        description: `New discussion: "${d.title.substring(0, 50)}${d.title.length > 50 ? '...' : ''}"`,
        timestamp: d.createdAt,
      });
    });

    sessions.slice(0, 5).forEach((s) => {
      activities.push({
        type: 'practice',
        description: `Practice session completed - Score: ${s.accuracyPercentage || 0}%`,
        timestamp: s.completedAt || s.startedAt,
      });
    });

    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 10);
  }

  async getWeeklyStats() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [weeklySessions, weeklyQuestions, sessionsByDay] = await Promise.all([
      this.practiceSessionRepository.count({
        where: { status: SessionStatus.COMPLETED },
      }),
      this.questionRepository
        .createQueryBuilder('question')
        .where('question.createdAt >= :weekAgo', { weekAgo })
        .getCount(),
      this.getSessionsByDay(weekAgo),
    ]);

    return {
      weeklyPracticeSessions: weeklySessions,
      weeklyQuestionsAdded: weeklyQuestions,
      sessionsByDay,
    };
  }

  private async getSessionsByDay(startDate: Date) {
    const sessions = await this.practiceSessionRepository
      .createQueryBuilder('session')
      .where('session.startedAt >= :startDate', { startDate })
      .andWhere('session.status = :status', { status: 'completed' })
      .getMany();

    const byDay: Record<string, number> = {};
    sessions.forEach((session) => {
      const day = new Date(session.startedAt).toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });

    return byDay;
  }
}

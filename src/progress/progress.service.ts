import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { UserStreak } from './entities/user-streak.entity';
import { PracticeSession } from '../practice/entities/practice-session.entity';
import { SessionAnswer } from '../practice/entities/session-answer.entity';
import { Course } from '../courses/entities/course.entity';
import { SessionStatus } from '../common/enums/practice.enum';

interface WeeklyTrend {
  week: string;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  hoursSpent: number;
}

interface SubjectPerformance {
  courseId: string;
  courseName: string;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
}

interface DailyActivity {
  date: string;
  questionsAnswered: number;
  hoursSpent: number;
  sessionsCompleted: number;
}

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(UserStreak)
    private userStreakRepository: Repository<UserStreak>,
    @InjectRepository(PracticeSession)
    private practiceSessionRepository: Repository<PracticeSession>,
    @InjectRepository(SessionAnswer)
    private sessionAnswerRepository: Repository<SessionAnswer>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async getStudyTrends(userId: string) {
    const sessions = await this.practiceSessionRepository.find({
      where: { userId, status: SessionStatus.COMPLETED },
      order: { completedAt: 'DESC' },
    });

    const weeklyMap = new Map<
      string,
      {
        questionsAnswered: number;
        correctAnswers: number;
        timeSpentSeconds: number;
      }
    >();
    const dailyMap = new Map<
      string,
      {
        questionsAnswered: number;
        timeSpentSeconds: number;
        sessionsCompleted: number;
      }
    >();

    for (const session of sessions) {
      if (!session.completedAt) continue;

      const date = new Date(session.completedAt);
      const dateStr = date.toISOString().split('T')[0];
      const weekStr = this.getWeekString(date);

      if (!weeklyMap.has(weekStr)) {
        weeklyMap.set(weekStr, {
          questionsAnswered: 0,
          correctAnswers: 0,
          timeSpentSeconds: 0,
        });
      }
      const week = weeklyMap.get(weekStr)!;
      week.questionsAnswered += session.totalAnswered;
      week.correctAnswers += session.correctAnswers;
      week.timeSpentSeconds += session.timeSpentSeconds;

      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, {
          questionsAnswered: 0,
          timeSpentSeconds: 0,
          sessionsCompleted: 0,
        });
      }
      const day = dailyMap.get(dateStr)!;
      day.questionsAnswered += session.totalAnswered;
      day.timeSpentSeconds += session.timeSpentSeconds;
      day.sessionsCompleted += 1;
    }

    const weeklyTrends: WeeklyTrend[] = Array.from(weeklyMap.entries())
      .map(([week, data]) => ({
        week,
        questionsAnswered: data.questionsAnswered,
        correctAnswers: data.correctAnswers,
        accuracy:
          data.questionsAnswered > 0
            ? Math.round(
                (data.correctAnswers / data.questionsAnswered) * 100 * 10,
              ) / 10
            : 0,
        hoursSpent: Math.round((data.timeSpentSeconds / 3600) * 10) / 10,
      }))
      .sort((a, b) => a.week.localeCompare(b.week));

    const dailyActivity: DailyActivity[] = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        questionsAnswered: data.questionsAnswered,
        hoursSpent: Math.round((data.timeSpentSeconds / 3600) * 10) / 10,
        sessionsCompleted: data.sessionsCompleted,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const weeklyHours = weeklyTrends.map((w) => ({
      week: w.week,
      hours: w.hoursSpent,
    }));

    return { weeklyTrends, dailyActivity, weeklyHours };
  }

  async getWeeklyStudyHours(userId: string) {
    const sessions = await this.practiceSessionRepository.find({
      where: { userId, status: SessionStatus.COMPLETED },
    });

    const weeklyMap = new Map<string, number>();

    for (const session of sessions) {
      if (!session.completedAt) continue;
      const weekStr = this.getWeekString(new Date(session.completedAt));
      const current = weeklyMap.get(weekStr) || 0;
      weeklyMap.set(weekStr, current + session.timeSpentSeconds);
    }

    const weeks = Array.from(weeklyMap.entries())
      .map(([week, seconds]) => ({
        week,
        hours: Math.round((seconds / 3600) * 10) / 10,
      }))
      .sort((a, b) => a.week.localeCompare(b.week));

    const totalHours =
      Math.round(weeks.reduce((sum, w) => sum + w.hours, 0) * 10) / 10;

    return { weeks, totalHours };
  }

  async getOverallPerformance(userId: string) {
    const sessions = await this.practiceSessionRepository.find({
      where: { userId, status: SessionStatus.COMPLETED },
      order: { completedAt: 'DESC' },
      relations: ['course'],
    });

    const streak = await this.userStreakRepository.findOne({
      where: { userId },
    });

    const courseMap = new Map<
      string,
      { courseName: string; questionsAnswered: number; correctAnswers: number }
    >();

    let totalQuestionsAnswered = 0;
    let totalCorrectAnswers = 0;
    let totalTimeSeconds = 0;

    for (const session of sessions) {
      totalQuestionsAnswered += session.totalAnswered;
      totalCorrectAnswers += session.correctAnswers;
      totalTimeSeconds += session.timeSpentSeconds;

      const courseId = session.courseId;
      const courseName = session.course?.title || 'Unknown Course';

      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          courseName,
          questionsAnswered: 0,
          correctAnswers: 0,
        });
      }
      const entry = courseMap.get(courseId)!;
      entry.questionsAnswered += session.totalAnswered;
      entry.correctAnswers += session.correctAnswers;
    }

    const subjectPerformance: SubjectPerformance[] = Array.from(
      courseMap.entries(),
    ).map(([courseId, data]) => ({
      courseId,
      courseName: data.courseName,
      questionsAnswered: data.questionsAnswered,
      correctAnswers: data.correctAnswers,
      accuracy:
        data.questionsAnswered > 0
          ? Math.round(
              (data.correctAnswers / data.questionsAnswered) * 100 * 10,
            ) / 10
          : 0,
    }));

    const recentSessions = sessions.slice(0, 5).map((s) => ({
      id: s.id,
      courseTitle: s.course?.title || 'Unknown Course',
      score: s.accuracyPercentage || 0,
      completedAt: s.completedAt,
    }));

    return {
      totalQuestionsAnswered,
      totalCorrectAnswers,
      overallAccuracy:
        totalQuestionsAnswered > 0
          ? Math.round(
              (totalCorrectAnswers / totalQuestionsAnswered) * 100 * 10,
            ) / 10
          : 0,
      totalHoursStudied: Math.round((totalTimeSeconds / 3600) * 10) / 10,
      totalSessionsCompleted: sessions.length,
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      subjectPerformance,
      recentSessions,
    };
  }

  async getStreakInfo(userId: string) {
    const streak = await this.updateStreak(userId);

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastPracticeDate: streak.lastPracticeDate,
      weeklyActivity: streak.weeklyActivity,
    };
  }

  async updateStreak(userId: string): Promise<UserStreak> {
    let streak = await this.userStreakRepository.findOne({
      where: { userId },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const hasPracticedToday = await this.practiceSessionRepository.findOne({
      where: {
        userId,
        status: SessionStatus.COMPLETED,
        completedAt: MoreThanOrEqual(today),
      },
    });

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (!streak) {
      streak = this.userStreakRepository.create({
        userId,
        currentStreak: hasPracticedToday ? 1 : 0,
        longestStreak: hasPracticedToday ? 1 : 0,
        lastPracticeDate: hasPracticedToday ? today : undefined,
        weeklyActivity: [],
      });
    } else {
      const lastDate = streak.lastPracticeDate
        ? new Date(streak.lastPracticeDate).toISOString().split('T')[0]
        : null;

      if (hasPracticedToday && lastDate !== todayStr) {
        if (lastDate === yesterdayStr) {
          streak.currentStreak += 1;
        } else if (lastDate !== todayStr) {
          streak.currentStreak = 1;
        }
        streak.lastPracticeDate = today;
      } else if (
        !hasPracticedToday &&
        lastDate &&
        lastDate !== yesterdayStr &&
        lastDate !== todayStr
      ) {
        streak.currentStreak = 0;
      }

      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
    }

    const weeklyActivity: Array<{ date: string; practiced: boolean }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const dayStart = new Date(d);
      const dayEnd = new Date(d);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const count = await this.practiceSessionRepository.count({
        where: {
          userId,
          status: SessionStatus.COMPLETED,
          completedAt: MoreThanOrEqual(dayStart),
        },
      });

      weeklyActivity.push({ date: dateStr, practiced: count > 0 });
    }
    streak.weeklyActivity = weeklyActivity;

    return this.userStreakRepository.save(streak);
  }

  private getWeekString(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    );
    return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }
}

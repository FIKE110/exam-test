import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStreak } from './entities/user-streak.entity';
import { PracticeSession } from '../practice/entities/practice-session.entity';

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

interface OverallPerformance {
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  totalHoursStudied: number;
  totalSessionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  subjectPerformance: SubjectPerformance[];
  recentSessions: {
    id: string;
    courseTitle: string;
    score: number;
    completedAt: Date;
  }[];
}

interface StudyTrends {
  weeklyTrends: WeeklyTrend[];
  dailyActivity: DailyActivity[];
  weeklyHours: { week: string; hours: number }[];
}

@Injectable()
export class ProgressService {
  private mockWeeklyTrends: WeeklyTrend[] = [
    {
      week: '2026-W11',
      questionsAnswered: 145,
      correctAnswers: 112,
      accuracy: 77.2,
      hoursSpent: 8.5,
    },
    {
      week: '2026-W12',
      questionsAnswered: 168,
      correctAnswers: 134,
      accuracy: 79.8,
      hoursSpent: 10.2,
    },
    {
      week: '2026-W13',
      questionsAnswered: 132,
      correctAnswers: 108,
      accuracy: 81.8,
      hoursSpent: 7.5,
    },
    {
      week: '2026-W14',
      questionsAnswered: 195,
      correctAnswers: 162,
      accuracy: 83.1,
      hoursSpent: 12.0,
    },
    {
      week: '2026-W15',
      questionsAnswered: 178,
      correctAnswers: 152,
      accuracy: 85.4,
      hoursSpent: 9.8,
    },
    {
      week: '2026-W16',
      questionsAnswered: 210,
      correctAnswers: 183,
      accuracy: 87.1,
      hoursSpent: 11.5,
    },
    {
      week: '2026-W17',
      questionsAnswered: 225,
      correctAnswers: 198,
      accuracy: 88.0,
      hoursSpent: 13.2,
    },
  ];

  private mockDailyActivity: DailyActivity[] = [
    {
      date: '2026-03-15',
      questionsAnswered: 25,
      hoursSpent: 1.5,
      sessionsCompleted: 2,
    },
    {
      date: '2026-03-16',
      questionsAnswered: 18,
      hoursSpent: 1.0,
      sessionsCompleted: 1,
    },
    {
      date: '2026-03-17',
      questionsAnswered: 42,
      hoursSpent: 2.5,
      sessionsCompleted: 3,
    },
    {
      date: '2026-03-18',
      questionsAnswered: 30,
      hoursSpent: 1.8,
      sessionsCompleted: 2,
    },
    {
      date: '2026-03-19',
      questionsAnswered: 35,
      hoursSpent: 2.0,
      sessionsCompleted: 2,
    },
    {
      date: '2026-03-20',
      questionsAnswered: 45,
      hoursSpent: 2.8,
      sessionsCompleted: 3,
    },
    {
      date: '2026-03-21',
      questionsAnswered: 30,
      hoursSpent: 1.6,
      sessionsCompleted: 2,
    },
  ];

  private mockSubjectPerformance: SubjectPerformance[] = [
    {
      courseId: '1',
      courseName: 'Pharmacology',
      questionsAnswered: 450,
      correctAnswers: 378,
      accuracy: 84.0,
    },
    {
      courseId: '2',
      courseName: 'Anatomy',
      questionsAnswered: 380,
      correctAnswers: 304,
      accuracy: 80.0,
    },
    {
      courseId: '3',
      courseName: 'Physiology',
      questionsAnswered: 320,
      correctAnswers: 256,
      accuracy: 80.0,
    },
    {
      courseId: '4',
      courseName: 'Biochemistry',
      questionsAnswered: 280,
      correctAnswers: 210,
      accuracy: 75.0,
    },
    {
      courseId: '5',
      courseName: 'Microbiology',
      questionsAnswered: 240,
      correctAnswers: 180,
      accuracy: 75.0,
    },
  ];

  constructor(
    @InjectRepository(UserStreak)
    private userStreakRepository: Repository<UserStreak>,
    @InjectRepository(PracticeSession)
    private practiceSessionRepository: Repository<PracticeSession>,
  ) {}

  async getStudyTrends(userId: string): Promise<StudyTrends> {
    await this.ensureUserStreak(userId);

    const weeklyHours = this.mockWeeklyTrends.map((w) => ({
      week: w.week,
      hours: w.hoursSpent,
    }));

    return {
      weeklyTrends: this.mockWeeklyTrends,
      dailyActivity: this.mockDailyActivity,
      weeklyHours,
    };
  }

  async getWeeklyStudyHours(
    userId: string,
  ): Promise<{ weeks: { week: string; hours: number }[]; totalHours: number }> {
    await this.ensureUserStreak(userId);

    const weeklyHours = this.mockWeeklyTrends.map((w) => ({
      week: w.week,
      hours: w.hoursSpent,
    }));

    const totalHours = weeklyHours.reduce((sum, w) => sum + w.hours, 0);

    return {
      weeks: weeklyHours,
      totalHours: Math.round(totalHours * 10) / 10,
    };
  }

  async getOverallPerformance(userId: string): Promise<OverallPerformance> {
    await this.ensureUserStreak(userId);

    const streak = await this.userStreakRepository.findOne({
      where: { userId },
    });

    const totalQuestionsAnswered = this.mockSubjectPerformance.reduce(
      (sum, s) => sum + s.questionsAnswered,
      0,
    );
    const totalCorrectAnswers = this.mockSubjectPerformance.reduce(
      (sum, s) => sum + s.correctAnswers,
      0,
    );
    const totalHours = this.mockWeeklyTrends.reduce(
      (sum, w) => sum + w.hoursSpent,
      0,
    );

    return {
      totalQuestionsAnswered,
      totalCorrectAnswers,
      overallAccuracy:
        Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100 * 10) /
        10,
      totalHoursStudied: Math.round(totalHours * 10) / 10,
      totalSessionsCompleted: 45,
      currentStreak: streak?.currentStreak || 7,
      longestStreak: streak?.longestStreak || 14,
      subjectPerformance: this.mockSubjectPerformance,
      recentSessions: [
        {
          id: '1',
          courseTitle: 'Pharmacology',
          score: 85,
          completedAt: new Date('2026-03-21'),
        },
        {
          id: '2',
          courseTitle: 'Anatomy',
          score: 78,
          completedAt: new Date('2026-03-20'),
        },
        {
          id: '3',
          courseTitle: 'Physiology',
          score: 92,
          completedAt: new Date('2026-03-19'),
        },
        {
          id: '4',
          courseTitle: 'Biochemistry',
          score: 70,
          completedAt: new Date('2026-03-18'),
        },
        {
          id: '5',
          courseTitle: 'Microbiology',
          score: 88,
          completedAt: new Date('2026-03-17'),
        },
      ],
    };
  }

  async getStreakInfo(userId: string) {
    const streak = await this.ensureUserStreak(userId);

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastPracticeDate: streak.lastPracticeDate,
      weeklyActivity: streak.weeklyActivity,
    };
  }

  private async ensureUserStreak(userId: string): Promise<UserStreak> {
    let streak = await this.userStreakRepository.findOne({
      where: { userId },
    });

    if (!streak) {
      streak = this.userStreakRepository.create({
        userId,
        currentStreak: 7,
        longestStreak: 14,
        lastPracticeDate: new Date(),
        weeklyActivity: [
          { date: '2026-03-15', practiced: true },
          { date: '2026-03-16', practiced: true },
          { date: '2026-03-17', practiced: true },
          { date: '2026-03-18', practiced: true },
          { date: '2026-03-19', practiced: true },
          { date: '2026-03-20', practiced: true },
          { date: '2026-03-21', practiced: true },
        ],
      });
      await this.userStreakRepository.save(streak);
    }

    return streak;
  }
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Milestone,
  UserMilestone,
  MilestoneType,
  MilestoneRarity,
} from './entities/milestone.entity';
import {
  PerformanceGoal,
  GoalType,
  GoalPeriod,
} from './entities/performance-goal.entity';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto';
import { PracticeSession } from '../practice/entities/practice-session.entity';

@Injectable()
export class GoalsService {
  private defaultMilestones: Partial<Milestone>[] = [
    {
      name: 'First Steps',
      description: 'Answer your first question',
      icon: '🎯',
      type: MilestoneType.QUESTIONS_ANSWERED,
      threshold: 1,
      rarity: MilestoneRarity.BRONZE,
    },
    {
      name: 'Getting Started',
      description: 'Answer 50 questions',
      icon: '📚',
      type: MilestoneType.QUESTIONS_ANSWERED,
      threshold: 50,
      rarity: MilestoneRarity.BRONZE,
    },
    {
      name: 'Dedicated Learner',
      description: 'Answer 100 questions',
      icon: '📖',
      type: MilestoneType.QUESTIONS_ANSWERED,
      threshold: 100,
      rarity: MilestoneRarity.SILVER,
    },
    {
      name: 'Question Master',
      description: 'Answer 500 questions',
      icon: '🏆',
      type: MilestoneType.QUESTIONS_ANSWERED,
      threshold: 500,
      rarity: MilestoneRarity.GOLD,
    },
    {
      name: 'Question Legend',
      description: 'Answer 1000 questions',
      icon: '👑',
      type: MilestoneType.QUESTIONS_ANSWERED,
      threshold: 1000,
      rarity: MilestoneRarity.PLATINUM,
    },
    {
      name: '3 Day Streak',
      description: 'Practice for 3 consecutive days',
      icon: '🔥',
      type: MilestoneType.STREAK_DAYS,
      threshold: 3,
      rarity: MilestoneRarity.BRONZE,
    },
    {
      name: 'Week Warrior',
      description: 'Practice for 7 consecutive days',
      icon: '⚡',
      type: MilestoneType.STREAK_DAYS,
      threshold: 7,
      rarity: MilestoneRarity.SILVER,
    },
    {
      name: 'Month Master',
      description: 'Practice for 30 consecutive days',
      icon: '💎',
      type: MilestoneType.STREAK_DAYS,
      threshold: 30,
      rarity: MilestoneRarity.GOLD,
    },
    {
      name: 'Consistent',
      description: 'Complete 10 practice sessions',
      icon: '🎯',
      type: MilestoneType.SESSIONS_COMPLETED,
      threshold: 10,
      rarity: MilestoneRarity.BRONZE,
    },
    {
      name: 'Regular',
      description: 'Complete 50 practice sessions',
      icon: '⭐',
      type: MilestoneType.SESSIONS_COMPLETED,
      threshold: 50,
      rarity: MilestoneRarity.SILVER,
    },
    {
      name: 'Dedicated',
      description: 'Complete 100 practice sessions',
      icon: '🌟',
      type: MilestoneType.SESSIONS_COMPLETED,
      threshold: 100,
      rarity: MilestoneRarity.GOLD,
    },
    {
      name: '90% Accuracy',
      description: 'Achieve 90% overall accuracy',
      icon: '🎯',
      type: MilestoneType.ACCURACY_TARGET,
      threshold: 90,
      rarity: MilestoneRarity.GOLD,
    },
    {
      name: '5 Hour Week',
      description: 'Study for 5 hours in a week',
      icon: '⏰',
      type: MilestoneType.WEEKLY_STUDY_HOURS,
      threshold: 5,
      rarity: MilestoneRarity.SILVER,
    },
    {
      name: '10 Hour Week',
      description: 'Study for 10 hours in a week',
      icon: '⏱️',
      type: MilestoneType.WEEKLY_STUDY_HOURS,
      threshold: 10,
      rarity: MilestoneRarity.GOLD,
    },
  ];

  constructor(
    @InjectRepository(Milestone)
    private milestoneRepository: Repository<Milestone>,
    @InjectRepository(UserMilestone)
    private userMilestoneRepository: Repository<UserMilestone>,
    @InjectRepository(PerformanceGoal)
    private goalRepository: Repository<PerformanceGoal>,
    @InjectRepository(PracticeSession)
    private practiceSessionRepository: Repository<PracticeSession>,
  ) {}

  async onModuleInit() {
    await this.seedMilestones();
  }

  private async seedMilestones() {
    const count = await this.milestoneRepository.count();
    if (count === 0) {
      const milestones = this.defaultMilestones.map((m) =>
        this.milestoneRepository.create(m),
      );
      await this.milestoneRepository.save(milestones);
    }
  }

  async getAllMilestones(userId: string) {
    const milestones = await this.milestoneRepository.find();
    const userMilestones = await this.userMilestoneRepository.find({
      where: { userId },
      relations: ['milestone'],
    });

    const earnedIds = userMilestones.map((um) => um.milestoneId);

    return {
      status: true,
      data: {
        milestones: milestones.map((m) => ({
          id: m.id,
          name: m.name,
          description: m.description,
          icon: m.icon,
          type: m.type,
          threshold: m.threshold,
          rarity: m.rarity,
          isEarned: earnedIds.includes(m.id),
        })),
        earnedCount: userMilestones.length,
        totalCount: milestones.length,
      },
    };
  }

  async getUserMilestones(userId: string) {
    const userMilestones = await this.userMilestoneRepository.find({
      where: { userId },
      relations: ['milestone'],
      order: { earnedAt: 'DESC' },
    });

    return {
      status: true,
      data: userMilestones.map((um) => ({
        id: um.id,
        milestone: {
          id: um.milestone.id,
          name: um.milestone.name,
          description: um.milestone.description,
          icon: um.milestone.icon,
          type: um.milestone.type,
          threshold: um.milestone.threshold,
          rarity: um.milestone.rarity,
        },
        earnedAt: um.earnedAt,
      })),
    };
  }

  async getUserGoals(userId: string) {
    const goals = await this.goalRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const activeGoals = goals.filter(
      (g) => !g.isCompleted || new Date(g.periodEnd) >= new Date(),
    );

    return {
      status: true,
      data: activeGoals.map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        goalType: g.goalType,
        period: g.period,
        targetValue: g.targetValue,
        currentValue: g.currentValue,
        progressPercentage: Math.min(
          100,
          Math.round((g.currentValue / g.targetValue) * 100),
        ),
        isCompleted: g.isCompleted,
        periodStart: g.periodStart,
        periodEnd: g.periodEnd,
      })),
    };
  }

  async createGoal(userId: string, dto: CreateGoalDto) {
    const { periodStart, periodEnd } = this.calculatePeriodDates(dto.period);

    const goalData = this.goalRepository.create({
      userId,
      name: dto.name,
      description: dto.description ?? null,
      goalType: dto.goalType,
      period: dto.period,
      targetValue: dto.targetValue,
      currentValue: 0,
      periodStart,
      periodEnd,
    } as any) as unknown as PerformanceGoal;

    await this.goalRepository.save(goalData);

    return {
      status: true,
      data: {
        id: goalData.id,
        name: goalData.name,
        goalType: goalData.goalType,
        period: goalData.period,
        targetValue: goalData.targetValue,
        currentValue: 0,
        progressPercentage: 0,
        isCompleted: false,
        periodStart: goalData.periodStart,
        periodEnd: goalData.periodEnd,
      },
    };
  }

  async updateGoal(userId: string, goalId: string, dto: UpdateGoalDto) {
    const goal = await this.goalRepository.findOne({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (dto.name) goal.name = dto.name;
    if (dto.description !== undefined)
      goal.description = dto.description ?? null;
    if (dto.targetValue) goal.targetValue = dto.targetValue;

    await this.goalRepository.save(goal);

    return {
      status: true,
      data: {
        id: goal.id,
        name: goal.name,
        goalType: goal.goalType,
        period: goal.period,
        targetValue: goal.targetValue,
        currentValue: goal.currentValue,
        progressPercentage: Math.min(
          100,
          Math.round((goal.currentValue / goal.targetValue) * 100),
        ),
        isCompleted: goal.isCompleted,
      },
    };
  }

  async deleteGoal(userId: string, goalId: string) {
    const goal = await this.goalRepository.findOne({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    await this.goalRepository.remove(goal);

    return { status: true, data: null };
  }

  async updateGoalProgress(userId: string, goalType: GoalType, value: number) {
    const goals = await this.goalRepository.find({
      where: { userId, goalType, isCompleted: false },
    });

    for (const goal of goals) {
      const now = new Date();
      const periodEnd = new Date(goal.periodEnd);

      if (now > periodEnd) {
        goal.isCompleted = true;
        goal.completedAt = goal.periodEnd;
        await this.goalRepository.save(goal);
        continue;
      }

      goal.currentValue += value;

      if (goal.currentValue >= goal.targetValue) {
        goal.isCompleted = true;
        goal.completedAt = new Date();
      }

      await this.goalRepository.save(goal);
    }
  }

  async checkAndAwardMilestones(userId: string) {
    const stats = await this.calculateUserStats(userId);
    const milestones = await this.milestoneRepository.find();
    const userMilestones = await this.userMilestoneRepository.find({
      where: { userId },
    });
    const earnedIds = userMilestones.map((um) => um.milestoneId);

    const newlyEarned: Milestone[] = [];

    for (const milestone of milestones) {
      if (earnedIds.includes(milestone.id)) continue;

      let earned = false;
      let currentValue = 0;

      switch (milestone.type) {
        case MilestoneType.QUESTIONS_ANSWERED:
          currentValue = stats.totalQuestionsAnswered;
          earned = currentValue >= milestone.threshold;
          break;
        case MilestoneType.SESSIONS_COMPLETED:
          currentValue = stats.totalSessionsCompleted;
          earned = currentValue >= milestone.threshold;
          break;
        case MilestoneType.STREAK_DAYS:
          currentValue = stats.currentStreak;
          earned = currentValue >= milestone.threshold;
          break;
        case MilestoneType.ACCURACY_TARGET:
          currentValue = stats.overallAccuracy;
          earned = currentValue >= milestone.threshold;
          break;
        case MilestoneType.WEEKLY_STUDY_HOURS:
          currentValue = stats.weeklyStudyHours;
          earned = currentValue >= milestone.threshold;
          break;
      }

      if (earned) {
        const userMilestone = this.userMilestoneRepository.create({
          userId,
          milestoneId: milestone.id,
          earnedAt: new Date(),
        });
        await this.userMilestoneRepository.save(userMilestone);
        newlyEarned.push(milestone);
      }
    }

    return newlyEarned;
  }

  private async calculateUserStats(userId: string) {
    const sessions = await this.practiceSessionRepository.find({
      where: { userId },
    });

    const totalQuestionsAnswered = sessions.reduce(
      (sum, s) => sum + (s.totalAnswered || 0),
      0,
    );
    const totalSessionsCompleted = sessions.filter(
      (s) => s.status === 'completed',
    ).length;

    const completedSessions = sessions.filter((s) => s.accuracyPercentage);
    const overallAccuracy =
      completedSessions.length > 0
        ? completedSessions.reduce(
            (sum, s) => sum + (s.accuracyPercentage || 0),
            0,
          ) / completedSessions.length
        : 0;

    const weeklyHours =
      sessions
        .filter((s) => {
          const sessionDate = new Date(s.completedAt || s.startedAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return sessionDate >= weekAgo;
        })
        .reduce((sum, s) => sum + (s.timeSpentSeconds || 0), 0) / 3600;

    return {
      totalQuestionsAnswered,
      totalSessionsCompleted,
      currentStreak: 0,
      overallAccuracy: Math.round(overallAccuracy * 10) / 10,
      weeklyStudyHours: Math.round(weeklyHours * 10) / 10,
    };
  }

  private calculatePeriodDates(period: GoalPeriod): {
    periodStart: Date;
    periodEnd: Date;
  } {
    const now = new Date();
    const periodStart = new Date(now);
    let periodEnd = new Date(now);

    switch (period) {
      case GoalPeriod.DAILY:
        periodEnd.setDate(periodEnd.getDate() + 1);
        periodEnd.setHours(23, 59, 59, 999);
        break;
      case GoalPeriod.WEEKLY:
        periodEnd.setDate(periodEnd.getDate() + (7 - periodEnd.getDay()));
        periodEnd.setHours(23, 59, 59, 999);
        break;
      case GoalPeriod.MONTHLY:
        periodEnd = new Date(
          periodStart.getFullYear(),
          periodStart.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );
        break;
      case GoalPeriod.ONGOING:
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        break;
    }

    return { periodStart, periodEnd };
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, PlanType } from './entities/subscription.entity';
import {
  SubscriptionPlanDto,
  UserSubscriptionDto,
} from './dto/subscription.dto';

@Injectable()
export class SubscriptionsService {
  private readonly plans: SubscriptionPlanDto[] = [
    {
      id: 'plan_free',
      name: 'Free',
      price: 0,
      billingCycle: 'forever',
      description: 'Get started with basic exam preparation features.',
      features: [
        { feature: 'Access to 5 courses', included: true },
        { feature: '50 practice questions per month', included: true },
        { feature: 'Basic progress tracking', included: true },
        { feature: 'Community support', included: true },
        { feature: 'Unlimited courses', included: false },
        { feature: 'Unlimited practice questions', included: false },
        { feature: 'Mock exams', included: false },
        { feature: 'AI study assistant', included: false },
        { feature: 'Priority support', included: false },
        { feature: 'Downloadable study materials', included: false },
      ],
    },
    {
      id: 'plan_paid',
      name: 'Paid',
      price: 10,
      billingCycle: 'monthly',
      description: 'Full access to all exam preparation features.',
      features: [
        { feature: 'Unlimited courses', included: true },
        { feature: 'Unlimited practice questions', included: true },
        { feature: 'Mock exams', included: true },
        { feature: 'AI study assistant', included: true },
        { feature: 'Advanced progress tracking', included: true },
        { feature: 'Priority support', included: true },
        { feature: 'Downloadable study materials', included: true },
        { feature: 'Study streak protection', included: true },
        { feature: 'Performance analytics', included: true },
        { feature: 'Certificate of completion', included: true },
      ],
      isPopular: true,
    },
  ];

  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  async getPlans(): Promise<SubscriptionPlanDto[]> {
    return this.plans;
  }

  async getUserSubscription(
    userId: string,
  ): Promise<UserSubscriptionDto | null> {
    let subscription = await this.subscriptionRepository.findOne({
      where: { userId },
    });

    if (!subscription) {
      subscription = this.subscriptionRepository.create({
        userId,
        planType: PlanType.FREE,
        isActive: true,
        startedAt: new Date(),
      });
      await this.subscriptionRepository.save(subscription);
    }

    return this.mapToUserSubscription(subscription);
  }

  async subscribe(
    userId: string,
    planId: string,
  ): Promise<UserSubscriptionDto> {
    let subscription = await this.subscriptionRepository.findOne({
      where: { userId },
    });

    const planType = planId === 'plan_free' ? PlanType.FREE : PlanType.PAID;
    const now = new Date();
    let expiresAt: Date | null = null;

    if (planType === PlanType.PAID) {
      expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    if (!subscription) {
      subscription = this.subscriptionRepository.create({
        userId,
        planType,
        billingCycle: planType === PlanType.PAID ? ('monthly' as any) : null,
        startedAt: now,
        expiresAt,
        isActive: true,
        paymentReference:
          planType === PlanType.PAID ? `mock_${Date.now()}` : null,
      });
    } else {
      subscription.planType = planType;
      subscription.billingCycle =
        planType === PlanType.PAID ? ('monthly' as any) : null;
      subscription.startedAt = now;
      subscription.expiresAt = expiresAt;
      subscription.isActive = true;
      subscription.paymentReference =
        planType === PlanType.PAID ? `mock_${Date.now()}` : null;
    }

    await this.subscriptionRepository.save(subscription);
    return this.mapToUserSubscription(subscription);
  }

  async cancelSubscription(userId: string): Promise<UserSubscriptionDto> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    subscription.planType = PlanType.FREE;
    subscription.billingCycle = null;
    subscription.isActive = false;
    subscription.expiresAt = new Date();

    await this.subscriptionRepository.save(subscription);
    return this.mapToUserSubscription(subscription);
  }

  private mapToUserSubscription(
    subscription: Subscription,
  ): UserSubscriptionDto {
    const planName = subscription.planType === PlanType.FREE ? 'Free' : 'Paid';
    const planFeatures = this.getFeaturesForPlan(subscription.planType);

    return {
      id: subscription.id,
      planType: subscription.planType,
      billingCycle: subscription.billingCycle,
      startedAt: subscription.startedAt?.toISOString() || null,
      expiresAt: subscription.expiresAt?.toISOString() || null,
      isActive: subscription.isActive,
      plan: {
        name: planName,
        features: planFeatures,
      },
    };
  }

  private getFeaturesForPlan(planType: PlanType): string[] {
    if (planType === PlanType.FREE) {
      return [
        'Access to 5 courses',
        '50 practice questions per month',
        'Basic progress tracking',
        'Community support',
      ];
    }
    return [
      'Unlimited courses',
      'Unlimited practice questions',
      'Mock exams',
      'AI study assistant',
      'Advanced progress tracking',
      'Priority support',
      'Downloadable study materials',
      'Study streak protection',
      'Performance analytics',
      'Certificate of completion',
    ];
  }
}

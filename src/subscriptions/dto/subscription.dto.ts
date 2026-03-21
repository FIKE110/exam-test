export class PlanFeatureDto {
  feature: string;
  included: boolean;
}

export class SubscriptionPlanDto {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  description: string;
  features: PlanFeatureDto[];
  isPopular?: boolean;
}

export class UserSubscriptionDto {
  id: string;
  planType: string;
  billingCycle: string | null;
  startedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  plan: {
    name: string;
    features: string[];
  };
}

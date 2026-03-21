import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSettings } from './entities/platform-settings.entity';

export interface PlatformConfig {
  platformName: string;
  supportEmail: string;
  freePlanQuestions: number;
  freePlanTopics: number;
  paidPlanPrice: number;
  subscriptionBillingCycle: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

@Injectable()
export class AdminSettingsService {
  private defaultSettings: Partial<PlatformSettings>[] = [
    {
      key: 'platform_name',
      value: 'ExamPrep',
      description: 'Platform name shown to users',
      type: 'string',
      isActive: true,
    },
    {
      key: 'support_email',
      value: 'support@examprep.com',
      description: 'Support email address',
      type: 'string',
      isActive: true,
    },
    {
      key: 'free_plan_questions',
      value: '50',
      description: 'Monthly questions limit for free plan',
      type: 'number',
      isActive: true,
    },
    {
      key: 'free_plan_topics',
      value: '2',
      description: 'Max topics for free plan',
      type: 'number',
      isActive: true,
    },
    {
      key: 'paid_plan_price',
      value: '10',
      description: 'Paid plan price in USD',
      type: 'number',
      isActive: true,
    },
    {
      key: 'subscription_billing_cycle',
      value: 'monthly',
      description: 'Billing cycle for paid plan',
      type: 'string',
      isActive: true,
    },
    {
      key: 'maintenance_mode',
      value: 'false',
      description: 'Enable/disable maintenance mode',
      type: 'boolean',
      isActive: true,
    },
    {
      key: 'maintenance_message',
      value: 'We are currently under maintenance. Please try again later.',
      description: 'Maintenance mode message',
      type: 'string',
      isActive: true,
    },
  ];

  constructor(
    @InjectRepository(PlatformSettings)
    private settingsRepository: Repository<PlatformSettings>,
  ) {}

  async onModuleInit() {
    await this.seedSettings();
  }

  private async seedSettings() {
    for (const setting of this.defaultSettings) {
      const exists = await this.settingsRepository.findOne({
        where: { key: setting.key },
      });
      if (!exists) {
        await this.settingsRepository.save(
          this.settingsRepository.create(setting),
        );
      }
    }
  }

  async getSettings(): Promise<PlatformConfig> {
    const settings = await this.settingsRepository.find();

    const getValue = (key: string, defaultValue: string = ''): string => {
      const setting = settings.find((s) => s.key === key);
      return setting?.value || defaultValue;
    };

    return {
      platformName: getValue('platform_name', 'ExamPrep'),
      supportEmail: getValue('support_email', 'support@examprep.com'),
      freePlanQuestions: parseInt(getValue('free_plan_questions', '50'), 10),
      freePlanTopics: parseInt(getValue('free_plan_topics', '2'), 10),
      paidPlanPrice: parseFloat(getValue('paid_plan_price', '10')),
      subscriptionBillingCycle: getValue(
        'subscription_billing_cycle',
        'monthly',
      ),
      maintenanceMode: getValue('maintenance_mode') === 'true',
      maintenanceMessage: getValue(
        'maintenance_message',
        'We are currently under maintenance.',
      ),
    };
  }

  async getSetting(key: string): Promise<PlatformSettings | null> {
    return this.settingsRepository.findOne({ where: { key } });
  }

  async updateSetting(key: string, value: string): Promise<PlatformSettings> {
    const setting = await this.settingsRepository.findOne({ where: { key } });

    if (!setting) {
      throw new Error(`Setting with key "${key}" not found`);
    }

    setting.value = value;
    await this.settingsRepository.save(setting);

    return setting;
  }

  async updateSettings(
    updates: Record<string, string>,
  ): Promise<PlatformConfig> {
    for (const [key, value] of Object.entries(updates)) {
      await this.updateSetting(key, value);
    }
    return this.getSettings();
  }

  async getAllSettingsRaw(): Promise<PlatformSettings[]> {
    return this.settingsRepository.find({
      order: { key: 'ASC' },
    });
  }
}

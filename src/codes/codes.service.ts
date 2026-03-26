import { Injectable } from '@nestjs/common';
import { ProfessionCode } from '../common/enums/profession.enum';
import { ExamTypeCode } from '../common/enums/exam-type.enum';
import {
  Difficulty,
  SessionType,
  QuestionType,
} from '../common/enums/practice.enum';
import {
  SubscriptionTier,
  SubscriptionStatus,
} from '../common/enums/subscription.enum';
import { NotificationTag } from '../notifications/entities/notification.entity';
import { CourseCategory } from '../courses/entities/course.entity';
import {
  GoalType,
  GoalPeriod,
} from '../goals/entities/performance-goal.entity';
import {
  MilestoneType,
  MilestoneRarity,
} from '../goals/entities/milestone.entity';
import { EventType } from '../events/entities/event.entity';
import {
  TicketStatus,
  TicketPriority,
} from '../chat-support/entities/support-ticket.entity';
import { AdminRole } from '../admin/entities/admin.entity';
import { Role } from '../common/decorators/roles.decorator';

export interface CodeItem {
  code: string;
  label: string;
}

@Injectable()
export class CodesService {
  getProfessions(): CodeItem[] {
    const labels: Record<string, string> = {
      STUDENT: 'Student',
      DOCTOR: 'Doctor',
      NURSE: 'Nurse',
      ENGINEER: 'Engineer',
      TEACHER: 'Teacher',
      ACCOUNTANT: 'Accountant',
      IT_PROFESSIONAL: 'IT Professional',
      LAWYER: 'Lawyer',
      BUSINESS_PROFESSIONAL: 'Business Professional',
      OTHER: 'Other',
    };
    return Object.values(ProfessionCode).map((code) => ({
      code,
      label: labels[code] || code,
    }));
  }

  getExamTypes(): CodeItem[] {
    const labels: Record<string, string> = {
      WAEC: 'WAEC',
      NECO: 'NECO',
      JAMB: 'JAMB',
      GRE: 'GRE',
      GMAT: 'GMAT',
      SAT: 'SAT',
      PLAB: 'PLAB',
      USMLE: 'USMLE',
      NCLEX: 'NCLEX',
      AMC: 'AMC',
      NURSING_EXAM: 'Nursing Exam',
      MRCP: 'MRCP',
      AWS_CERTIFICATION: 'AWS Certification',
      AZURE_CERTIFICATION: 'Azure Certification',
      GOOGLE_CLOUD: 'Google Cloud',
      CISSP: 'CISSP',
      COMPTIA: 'CompTIA',
      CCNA: 'CCNA',
      CPA: 'CPA',
      CFA: 'CFA',
      ACCA: 'ACCA',
      CA: 'CA',
      FRM: 'FRM',
      BAR_EXAM: 'Bar Exam',
      LLM: 'LLM',
      CLPE: 'CLPE',
      PMP: 'PMP',
      MBA: 'MBA',
      SIX_SIGMA: 'Six Sigma',
      AGILE: 'Agile',
    };
    return Object.values(ExamTypeCode).map((code) => ({
      code,
      label: labels[code] || code,
    }));
  }

  getDifficulties(): CodeItem[] {
    const labels: Record<string, string> = {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
    };
    return Object.values(Difficulty).map((code) => ({
      code,
      label: labels[code] || code,
    }));
  }

  getSessionTypes(): CodeItem[] {
    const labels: Record<string, string> = {
      focused: 'Focused Practice',
      mock_exam: 'Mock Exam',
    };
    return Object.values(SessionType).map((code) => ({
      code,
      label: labels[code] || code,
    }));
  }

  getQuestionTypes(): CodeItem[] {
    const labels: Record<string, string> = {
      single_choice: 'Single Choice',
      multiple_choice: 'Multiple Choice',
    };
    return Object.values(QuestionType).map((code) => ({
      code,
      label: labels[code] || code,
    }));
  }

  getCourseCategories(): CodeItem[] {
    const labels: Record<string, string> = {
      medical: 'Medical',
      technology: 'Technology',
      business: 'Business',
      law: 'Law',
      accounting: 'Accounting',
      engineering: 'Engineering',
      general: 'General',
    };
    return Object.values(CourseCategory).map((code) => ({
      code,
      label: labels[code] || code,
    }));
  }

  getSubscriptionTiers(): CodeItem[] {
    const labels: Record<string, string> = {
      free: 'Free',
      premium: 'Premium',
    };
    return Object.values(SubscriptionTier).map((code) => ({
      code,
      label: labels[code] || code,
    }));
  }

  getSubscriptionStatuses(): CodeItem[] {
    const labels: Record<string, string> = {
      active: 'Active',
      cancelled: 'Cancelled',
      expired: 'Expired',
      suspended: 'Suspended',
    };
    return Object.values(SubscriptionStatus).map((code) => ({
      code,
      label: labels[code] || code,
    }));
  }

  getNotificationTags(): CodeItem[] {
    const labels: Record<string, string> = {
      admin: 'Admin',
      system: 'System',
      user: 'User',
      course: 'Course',
      exam: 'Exam',
      progress: 'Progress',
      subscription: 'Subscription',
      general: 'General',
    };
    return Object.values(NotificationTag).map((code) => ({
      code,
      label: labels[code] || code,
    }));
  }

  getGoalTypes(): CodeItem[] {
    const labels: Record<string, string> = {
      daily_questions: 'Daily Questions',
      weekly_questions: 'Weekly Questions',
      weekly_study_hours: 'Weekly Study Hours',
      accuracy_target: 'Accuracy Target',
      streak_days: 'Streak Days',
    };
    return Object.values(GoalType).map((code) => ({
      code,
      label: labels[code] || code,
    }));
  }

  getGoalPeriods(): CodeItem[] {
    const labels: Record<string, string> = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      ongoing: 'Ongoing',
    };
    return Object.values(GoalPeriod).map((code) => ({
      code,
      label: labels[code] || code,
    }));
  }

  getMilestoneTypes(): CodeItem[] {
    const labels: Record<string, string> = {
      questions_answered: 'Questions Answered',
      streak_days: 'Streak Days',
      accuracy_target: 'Accuracy Target',
      sessions_completed: 'Sessions Completed',
      courses_completed: 'Courses Completed',
      weekly_study_hours: 'Weekly Study Hours',
    };
    return Object.values(MilestoneType).map((code) => ({
      code,
      label: labels[code] || code,
    }));
  }

  getMilestoneRarities(): CodeItem[] {
    const labels: Record<string, string> = {
      bronze: 'Bronze',
      silver: 'Silver',
      gold: 'Gold',
      platinum: 'Platinum',
    };
    return Object.values(MilestoneRarity).map((code) => ({
      code,
      label: labels[code] || code,
    }));
  }

  getEventTypes(): CodeItem[] {
    const labels: Record<string, string> = {
      zoom: 'Virtual (Zoom)',
      physical: 'Physical',
    };
    return Object.values(EventType).map((code) => ({
      code,
      label: labels[code] || code,
    }));
  }

  getTicketStatuses(): CodeItem[] {
    const labels: Record<string, string> = {
      open: 'Open',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed',
    };
    return Object.values(TicketStatus).map((code) => ({
      code,
      label: labels[code] || code,
    }));
  }

  getTicketPriorities(): CodeItem[] {
    const labels: Record<string, string> = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    };
    return Object.values(TicketPriority).map((code) => ({
      code,
      label: labels[code] || code,
    }));
  }

  getAdminRoles(): CodeItem[] {
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      content_admin: 'Content Admin',
      support_admin: 'Support Admin',
    };
    return Object.values(AdminRole).map((code) => ({
      code,
      label: labels[code] || code,
    }));
  }

  getUserRoles(): CodeItem[] {
    const labels: Record<string, string> = {
      user: 'User',
      admin: 'Admin',
    };
    return Object.values(Role).map((code) => ({
      code,
      label: labels[code] || code,
    }));
  }

  getAllCodes(): Record<string, CodeItem[]> {
    return {
      professions: this.getProfessions(),
      examTypes: this.getExamTypes(),
      difficulties: this.getDifficulties(),
      sessionTypes: this.getSessionTypes(),
      questionTypes: this.getQuestionTypes(),
      courseCategories: this.getCourseCategories(),
      subscriptionTiers: this.getSubscriptionTiers(),
      subscriptionStatuses: this.getSubscriptionStatuses(),
      notificationTags: this.getNotificationTags(),
      goalTypes: this.getGoalTypes(),
      goalPeriods: this.getGoalPeriods(),
      milestoneTypes: this.getMilestoneTypes(),
      milestoneRarities: this.getMilestoneRarities(),
      eventTypes: this.getEventTypes(),
      ticketStatuses: this.getTicketStatuses(),
      ticketPriorities: this.getTicketPriorities(),
      adminRoles: this.getAdminRoles(),
      userRoles: this.getUserRoles(),
    };
  }
}

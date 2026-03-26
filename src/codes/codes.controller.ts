import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CodesService } from './codes.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Codes')
@Controller('codes')
@Public()
export class CodesController {
  constructor(private readonly codesService: CodesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all codes',
    description:
      'Returns all available code enumerations used across the platform. Useful for populating dropdowns, filters, and form selects on the frontend.',
  })
  @ApiResponse({
    status: 200,
    description: 'All codes retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            professions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'DOCTOR' },
                  label: { type: 'string', example: 'Doctor' },
                },
              },
            },
            examTypes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'PLAB' },
                  label: { type: 'string', example: 'PLAB' },
                },
              },
            },
          },
        },
      },
    },
  })
  getAllCodes() {
    return { status: true, data: this.codesService.getAllCodes() };
  }

  @Get('professions')
  @ApiOperation({
    summary: 'Get profession codes',
    description:
      'Returns all available profession codes for user registration and profile.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profession codes retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'DOCTOR' },
              label: { type: 'string', example: 'Doctor' },
            },
          },
          example: [
            { code: 'STUDENT', label: 'Student' },
            { code: 'DOCTOR', label: 'Doctor' },
            { code: 'NURSE', label: 'Nurse' },
            { code: 'ENGINEER', label: 'Engineer' },
            { code: 'TEACHER', label: 'Teacher' },
            { code: 'ACCOUNTANT', label: 'Accountant' },
            { code: 'IT_PROFESSIONAL', label: 'IT Professional' },
            { code: 'LAWYER', label: 'Lawyer' },
            { code: 'BUSINESS_PROFESSIONAL', label: 'Business Professional' },
            { code: 'OTHER', label: 'Other' },
          ],
        },
      },
    },
  })
  getProfessions() {
    return { status: true, data: this.codesService.getProfessions() };
  }

  @Get('exam-types')
  @ApiOperation({
    summary: 'Get exam type codes',
    description:
      'Returns all available exam type codes for course filtering and registration.',
  })
  @ApiResponse({
    status: 200,
    description: 'Exam type codes retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'PLAB' },
              label: { type: 'string', example: 'PLAB' },
            },
          },
        },
      },
    },
  })
  getExamTypes() {
    return { status: true, data: this.codesService.getExamTypes() };
  }

  @Get('difficulties')
  @ApiOperation({
    summary: 'Get difficulty levels',
    description:
      'Returns all available difficulty levels for questions and courses.',
  })
  @ApiResponse({
    status: 200,
    description: 'Difficulty levels retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'medium' },
              label: { type: 'string', example: 'Medium' },
            },
          },
          example: [
            { code: 'easy', label: 'Easy' },
            { code: 'medium', label: 'Medium' },
            { code: 'hard', label: 'Hard' },
          ],
        },
      },
    },
  })
  getDifficulties() {
    return { status: true, data: this.codesService.getDifficulties() };
  }

  @Get('session-types')
  @ApiOperation({
    summary: 'Get practice session types',
    description: 'Returns all available practice session types.',
  })
  @ApiResponse({
    status: 200,
    description: 'Session types retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'focused' },
              label: { type: 'string', example: 'Focused Practice' },
            },
          },
          example: [
            { code: 'focused', label: 'Focused Practice' },
            { code: 'mock_exam', label: 'Mock Exam' },
          ],
        },
      },
    },
  })
  getSessionTypes() {
    return { status: true, data: this.codesService.getSessionTypes() };
  }

  @Get('question-types')
  @ApiOperation({
    summary: 'Get question types',
    description: 'Returns all available question types.',
  })
  @ApiResponse({
    status: 200,
    description: 'Question types retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'single_choice' },
              label: { type: 'string', example: 'Single Choice' },
            },
          },
          example: [
            { code: 'single_choice', label: 'Single Choice' },
            { code: 'multiple_choice', label: 'Multiple Choice' },
          ],
        },
      },
    },
  })
  getQuestionTypes() {
    return { status: true, data: this.codesService.getQuestionTypes() };
  }

  @Get('course-categories')
  @ApiOperation({
    summary: 'Get course categories',
    description: 'Returns all available course categories.',
  })
  @ApiResponse({
    status: 200,
    description: 'Course categories retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'medical' },
              label: { type: 'string', example: 'Medical' },
            },
          },
          example: [
            { code: 'medical', label: 'Medical' },
            { code: 'technology', label: 'Technology' },
            { code: 'business', label: 'Business' },
            { code: 'law', label: 'Law' },
            { code: 'accounting', label: 'Accounting' },
            { code: 'engineering', label: 'Engineering' },
            { code: 'general', label: 'General' },
          ],
        },
      },
    },
  })
  getCourseCategories() {
    return { status: true, data: this.codesService.getCourseCategories() };
  }

  @Get('subscription-tiers')
  @ApiOperation({
    summary: 'Get subscription tiers',
    description: 'Returns all available subscription tiers.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription tiers retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'free' },
              label: { type: 'string', example: 'Free' },
            },
          },
          example: [
            { code: 'free', label: 'Free' },
            { code: 'premium', label: 'Premium' },
          ],
        },
      },
    },
  })
  getSubscriptionTiers() {
    return { status: true, data: this.codesService.getSubscriptionTiers() };
  }

  @Get('subscription-statuses')
  @ApiOperation({
    summary: 'Get subscription statuses',
    description: 'Returns all available subscription statuses.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription statuses retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'active' },
              label: { type: 'string', example: 'Active' },
            },
          },
          example: [
            { code: 'active', label: 'Active' },
            { code: 'cancelled', label: 'Cancelled' },
            { code: 'expired', label: 'Expired' },
            { code: 'suspended', label: 'Suspended' },
          ],
        },
      },
    },
  })
  getSubscriptionStatuses() {
    return { status: true, data: this.codesService.getSubscriptionStatuses() };
  }

  @Get('notification-tags')
  @ApiOperation({
    summary: 'Get notification tags',
    description: 'Returns all available notification tags/categories.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification tags retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'system' },
              label: { type: 'string', example: 'System' },
            },
          },
          example: [
            { code: 'admin', label: 'Admin' },
            { code: 'system', label: 'System' },
            { code: 'user', label: 'User' },
            { code: 'course', label: 'Course' },
            { code: 'exam', label: 'Exam' },
            { code: 'progress', label: 'Progress' },
            { code: 'subscription', label: 'Subscription' },
            { code: 'general', label: 'General' },
          ],
        },
      },
    },
  })
  getNotificationTags() {
    return { status: true, data: this.codesService.getNotificationTags() };
  }

  @Get('goal-types')
  @ApiOperation({
    summary: 'Get goal types',
    description: 'Returns all available performance goal types.',
  })
  @ApiResponse({
    status: 200,
    description: 'Goal types retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'daily_questions' },
              label: { type: 'string', example: 'Daily Questions' },
            },
          },
          example: [
            { code: 'daily_questions', label: 'Daily Questions' },
            { code: 'weekly_questions', label: 'Weekly Questions' },
            { code: 'weekly_study_hours', label: 'Weekly Study Hours' },
            { code: 'accuracy_target', label: 'Accuracy Target' },
            { code: 'streak_days', label: 'Streak Days' },
          ],
        },
      },
    },
  })
  getGoalTypes() {
    return { status: true, data: this.codesService.getGoalTypes() };
  }

  @Get('goal-periods')
  @ApiOperation({
    summary: 'Get goal periods',
    description: 'Returns all available goal period types.',
  })
  @ApiResponse({
    status: 200,
    description: 'Goal periods retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'weekly' },
              label: { type: 'string', example: 'Weekly' },
            },
          },
          example: [
            { code: 'daily', label: 'Daily' },
            { code: 'weekly', label: 'Weekly' },
            { code: 'monthly', label: 'Monthly' },
            { code: 'ongoing', label: 'Ongoing' },
          ],
        },
      },
    },
  })
  getGoalPeriods() {
    return { status: true, data: this.codesService.getGoalPeriods() };
  }

  @Get('milestone-types')
  @ApiOperation({
    summary: 'Get milestone types',
    description: 'Returns all available milestone types.',
  })
  @ApiResponse({
    status: 200,
    description: 'Milestone types retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'questions_answered' },
              label: { type: 'string', example: 'Questions Answered' },
            },
          },
          example: [
            { code: 'questions_answered', label: 'Questions Answered' },
            { code: 'streak_days', label: 'Streak Days' },
            { code: 'accuracy_target', label: 'Accuracy Target' },
            { code: 'sessions_completed', label: 'Sessions Completed' },
            { code: 'courses_completed', label: 'Courses Completed' },
            { code: 'weekly_study_hours', label: 'Weekly Study Hours' },
          ],
        },
      },
    },
  })
  getMilestoneTypes() {
    return { status: true, data: this.codesService.getMilestoneTypes() };
  }

  @Get('milestone-rarities')
  @ApiOperation({
    summary: 'Get milestone rarities',
    description: 'Returns all available milestone rarity levels.',
  })
  @ApiResponse({
    status: 200,
    description: 'Milestone rarities retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'gold' },
              label: { type: 'string', example: 'Gold' },
            },
          },
          example: [
            { code: 'bronze', label: 'Bronze' },
            { code: 'silver', label: 'Silver' },
            { code: 'gold', label: 'Gold' },
            { code: 'platinum', label: 'Platinum' },
          ],
        },
      },
    },
  })
  getMilestoneRarities() {
    return { status: true, data: this.codesService.getMilestoneRarities() };
  }

  @Get('event-types')
  @ApiOperation({
    summary: 'Get event types',
    description: 'Returns all available event types.',
  })
  @ApiResponse({
    status: 200,
    description: 'Event types retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'zoom' },
              label: { type: 'string', example: 'Virtual (Zoom)' },
            },
          },
          example: [
            { code: 'zoom', label: 'Virtual (Zoom)' },
            { code: 'physical', label: 'Physical' },
          ],
        },
      },
    },
  })
  getEventTypes() {
    return { status: true, data: this.codesService.getEventTypes() };
  }

  @Get('ticket-statuses')
  @ApiOperation({
    summary: 'Get support ticket statuses',
    description: 'Returns all available support ticket statuses.',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket statuses retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'open' },
              label: { type: 'string', example: 'Open' },
            },
          },
          example: [
            { code: 'open', label: 'Open' },
            { code: 'in_progress', label: 'In Progress' },
            { code: 'resolved', label: 'Resolved' },
            { code: 'closed', label: 'Closed' },
          ],
        },
      },
    },
  })
  getTicketStatuses() {
    return { status: true, data: this.codesService.getTicketStatuses() };
  }

  @Get('ticket-priorities')
  @ApiOperation({
    summary: 'Get support ticket priorities',
    description: 'Returns all available support ticket priority levels.',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket priorities retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'high' },
              label: { type: 'string', example: 'High' },
            },
          },
          example: [
            { code: 'low', label: 'Low' },
            { code: 'medium', label: 'Medium' },
            { code: 'high', label: 'High' },
          ],
        },
      },
    },
  })
  getTicketPriorities() {
    return { status: true, data: this.codesService.getTicketPriorities() };
  }

  @Get('admin-roles')
  @ApiOperation({
    summary: 'Get admin roles',
    description: 'Returns all available admin role types.',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin roles retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'super_admin' },
              label: { type: 'string', example: 'Super Admin' },
            },
          },
          example: [
            { code: 'super_admin', label: 'Super Admin' },
            { code: 'content_admin', label: 'Content Admin' },
            { code: 'support_admin', label: 'Support Admin' },
          ],
        },
      },
    },
  })
  getAdminRoles() {
    return { status: true, data: this.codesService.getAdminRoles() };
  }

  @Get('user-roles')
  @ApiOperation({
    summary: 'Get user roles',
    description: 'Returns all available user role types.',
  })
  @ApiResponse({
    status: 200,
    description: 'User roles retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'user' },
              label: { type: 'string', example: 'User' },
            },
          },
          example: [
            { code: 'user', label: 'User' },
            { code: 'admin', label: 'Admin' },
          ],
        },
      },
    },
  })
  getUserRoles() {
    return { status: true, data: this.codesService.getUserRoles() };
  }

  @Get(':type')
  @ApiOperation({
    summary: 'Get codes by type',
    description:
      'Returns codes for a specific type. Use this endpoint when you know the exact code type you need.',
  })
  @ApiParam({
    name: 'type',
    description: 'Code type to retrieve',
    enum: [
      'professions',
      'exam-types',
      'difficulties',
      'session-types',
      'question-types',
      'course-categories',
      'subscription-tiers',
      'subscription-statuses',
      'notification-tags',
      'goal-types',
      'goal-periods',
      'milestone-types',
      'milestone-rarities',
      'event-types',
      'ticket-statuses',
      'ticket-priorities',
      'admin-roles',
      'user-roles',
    ],
    example: 'professions',
  })
  @ApiResponse({
    status: 200,
    description: 'Codes retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'DOCTOR' },
              label: { type: 'string', example: 'Doctor' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid code type',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: false },
        data: { type: 'null', example: null },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'BAD_REQUEST' },
            message: {
              type: 'string',
              example:
                'Invalid code type. Available types: professions, exam-types, difficulties, session-types, question-types, course-categories, subscription-tiers, subscription-statuses, notification-tags, goal-types, goal-periods, milestone-types, milestone-rarities, event-types, ticket-statuses, ticket-priorities, admin-roles, user-roles',
            },
          },
        },
      },
    },
  })
  getCodesByType(@Param('type') type: string) {
    const codeMap: Record<string, () => { code: string; label: string }[]> = {
      professions: () => this.codesService.getProfessions(),
      'exam-types': () => this.codesService.getExamTypes(),
      difficulties: () => this.codesService.getDifficulties(),
      'session-types': () => this.codesService.getSessionTypes(),
      'question-types': () => this.codesService.getQuestionTypes(),
      'course-categories': () => this.codesService.getCourseCategories(),
      'subscription-tiers': () => this.codesService.getSubscriptionTiers(),
      'subscription-statuses': () =>
        this.codesService.getSubscriptionStatuses(),
      'notification-tags': () => this.codesService.getNotificationTags(),
      'goal-types': () => this.codesService.getGoalTypes(),
      'goal-periods': () => this.codesService.getGoalPeriods(),
      'milestone-types': () => this.codesService.getMilestoneTypes(),
      'milestone-rarities': () => this.codesService.getMilestoneRarities(),
      'event-types': () => this.codesService.getEventTypes(),
      'ticket-statuses': () => this.codesService.getTicketStatuses(),
      'ticket-priorities': () => this.codesService.getTicketPriorities(),
      'admin-roles': () => this.codesService.getAdminRoles(),
      'user-roles': () => this.codesService.getUserRoles(),
    };

    const getter = codeMap[type];
    if (!getter) {
      const availableTypes = Object.keys(codeMap).join(', ');
      return {
        status: false,
        data: null,
        error: {
          code: 'BAD_REQUEST',
          message: `Invalid code type. Available types: ${availableTypes}`,
        },
      };
    }

    return { status: true, data: getter() };
  }
}

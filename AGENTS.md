# Backend Project: Exam Preparation Platform

## Overview
Backend API for an exam preparation platform with AI-powered study assistance, practice tests, mock exams, and progress tracking. Designed for candidates preparing for high-stakes professional exams abroad.

## Core Features (from Wireframes)

### User Management
- User authentication (login/signup)
- User profiles with avatars
- Subscription plans (free/upgrade)

### Learning Features
- **Exam Categories**: Different exam types and subjects with progress tracking
  - Course/subject enrollment
  - Progress percentage tracking
  - Time remaining estimation
  - Resume functionality

- **Practice Sessions**: 
  - Focused Practice (by topic and difficulty)
  - Mock Exams (timed exam simulations)
  - Question banks with categories
  - Practice results/accuracy tracking

- **AI Study Assistant**:
  - AI-powered tutoring/chat
  - Study material recommendations
  - Exam clarification and explanations

### Progress & Analytics
- **Track Progress**:
  - Daily streak tracking (3+ days)
  - Weekly activity calendar
  - Recent history of completed topics
  - Accuracy percentages per subject/topic
  - Performance goals and milestones

- **Study Materials**:
  - Curated learning resources
  - Topic-based organization

### Social Features
- **Peer Review**:
  - Discussion forums
  - Question sharing between candidates
  - Chat support

## Database Entities (Suggested)

```
Users
├── id, email, password_hash, name, avatar_url
├── subscription_tier (free/premium)
├── created_at, updated_at

Courses (Exam Subjects)
├── id, title, description, category
├── total_duration_hours, difficulty_level
├── created_at

UserCourseProgress
├── user_id, course_id
├── progress_percentage, time_spent_minutes
├── last_accessed_at, completed_at

PracticeSessions
├── id, user_id, session_type (focused/mock)
├── topic, difficulty, total_questions
├── correct_answers, accuracy_percentage
├── started_at, completed_at

Questions
├── id, category, topic, difficulty
├── question_text, options[], correct_answer
├── explanation, created_at

UserStreaks
├── user_id, current_streak, longest_streak
├── last_practice_date, weekly_activity[]

StudyMaterials
├── id, title, content, category
├── file_url, created_at

AIChatSessions
├── id, user_id, session_type
├── messages[], created_at

Discussions/PeerReview
├── id, user_id, question_id
├── content, replies[], created_at
```

## API Endpoints (Potential)

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

### Dashboard
- GET /api/dashboard/stats (streak, progress, recent activity)
- GET /api/dashboard/continue-learning

### Courses (Exam Subjects)
- GET /api/courses
- GET /api/courses/:id
- POST /api/courses/:id/enroll
- PUT /api/courses/:id/progress

### Practice
- POST /api/practice/start
- GET /api/practice/questions
- POST /api/practice/submit
- GET /api/practice/results
- GET /api/practice/history

### Mock Exams
- GET /api/mock-exams
- POST /api/mock-exams/:id/start
- POST /api/mock-exams/:id/submit
- GET /api/mock-exams/:id/results

### AI Study
- POST /api/ai/chat
- GET /api/ai/study-materials

### Progress
- GET /api/progress/stats
- GET /api/progress/streak
- GET /api/progress/history

### Peer Review
- GET /api/discussions
- POST /api/discussions
- POST /api/discussions/:id/reply

### Admin (from Admin Dashboard wireframe)
- User management
- Content management
- Analytics/statistics

## Technical Considerations

- **Real-time features**: WebSocket for AI chat, notifications
- **File storage**: For study materials, user avatars
- **Caching**: Redis for streaks, progress, frequent queries
- **Queue system**: For AI processing, report generation
- **Database indexing**: On user_id, course_id, dates
- **Security**: JWT auth, rate limiting, input validation

## Tech Stack
- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL + TypeORM
- **Authentication**: JWT (access & refresh tokens)
- **AI Integration**: OpenAI/Anthropic API
- **API Documentation**: Scalar
- **File Storage**: AWS S3 or similar
- **Real-time**: Socket.io or WebSockets (future)
- **Package Manager**: pnpm

## API Response Structure

All API endpoints follow a consistent response format:

### Success Response
```json
{
  "status": true,
  "data": {
    // Actual response data
  },
  "error": null,
  "meta": {
    "timestamp": "2025-02-11T10:30:00Z",
    "request_id": "uuid",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

### Error Response
```json
{
  "status": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-02-11T10:30:00Z",
    "request_id": "uuid"
  }
}
```

### HTTP Status Codes Used
- `200 OK`: Successful GET, PUT
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Implementation Status

### ✅ Completed
- **Project Setup**: NestJS initialized with TypeScript
- **Common Utilities**: 
  - TransformInterceptor (standardized API responses)
  - AllExceptionsFilter (consistent error handling)
  - ValidationPipe with class-validator
  - JWT Auth Guard
  - Roles Guard
  - Decorators: @CurrentUser, @Roles, @Public
- **Database**: TypeORM configured with PostgreSQL
- **Entities Created**:
  - User (with subscription tracking)
  - Course (exam subjects with categories)
  - UserCourseProgress (enrollment & progress)
  - Question (with flagging support)
  - PracticeSession (focused & mock exam modes)
  - SessionAnswer (user responses)
  - UserStreak (gamification)
  - AIChatSession (chat history)
- **Auth Module**: 
  - JWT strategy with access & refresh tokens
  - Register/Login endpoints
  - Password hashing with bcrypt
- **Users Module**:
  - Profile management
  - Admin user listing
- **Courses Module**:
  - CRUD operations
  - Enrollment system
  - Progress tracking
  - Search & filtering
- **API Documentation**: Scalar integration

### 🚧 Pending Implementation
- **Questions Module**:
  - CRUD operations
  - Question filtering by difficulty/topic
  - Admin question management
- **Practice Module**:
  - Start focused practice session
  - Start mock exam
  - Answer submission
  - Session completion & results
  - Time tracking
- **Progress Module**:
  - Streak calculation logic
  - Study trends analytics
  - Subject accuracy tracking
  - Weekly activity calendar
- **AI Module**:
  - Chat session management
  - OpenAI integration
  - Chat history persistence
- **Admin Module**:
  - Admin dashboard stats
  - User management
  - Question moderation
  - Flagged questions review
- **Additional Features**:
  - Study Materials management
  - Events & registration
  - File upload (avatars, materials)
  - Email notifications
  - Redis caching

## Project Structure
```
src/
├── common/              # Shared utilities
│   ├── interceptors/    # Response transformation
│   ├── filters/         # Exception handling
│   ├── pipes/           # Validation pipes
│   ├── guards/          # Auth & role guards
│   ├── decorators/      # Custom decorators
│   └── enums/           # Shared enums
├── auth/                # Authentication module
├── users/               # User management
├── courses/             # Exam subjects & enrollment
├── questions/           # Question bank
├── practice/            # Practice sessions
├── progress/            # Analytics & streaks
├── ai/                  # AI chat assistant
├── admin/               # Admin operations
├── database/            # Database configuration
└── config/              # App configuration
```

## Database Setup

The application uses PostgreSQL with TypeORM. Schema management is done via SQL files (not TypeORM synchronize) to avoid enum type issues:

1. Create database: `createdb -U postgres exam_preparation`
2. Run schema: `psql -U postgres -d exam_preparation -f db/schema.sql`
3. (Optional) Insert mock data: `psql -U postgres -d exam_preparation -f db/insert.sql`

**Note**: TypeORM `synchronize` is disabled. Always use `db/schema.sql` for schema changes.

## Notes
- Platform designed for exam preparation (medical, professional certifications, etc.)
- Gamification elements (streaks, goals)
- Subscription model with upgrade options
- Accuracy tracking for self-assessment
- Social learning through peer review
- **Always use pnpm as package manager**
- Copy `.env.example` to `.env` and configure before running

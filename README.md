# Exam Preparation Platform API

A comprehensive backend API for an exam preparation platform designed to help candidates prepare for high-stakes professional exams abroad. Features AI-powered study assistance, practice tests, mock exams, and progress tracking.

## Features

- **User Authentication**: JWT-based auth with access & refresh tokens
- **Exam Subjects**: Multiple categories (Medical, Technology, Business, Law, Accounting, Engineering)
- **Practice Sessions**: Focused practice by topic/difficulty and timed mock exams
- **AI Study Assistant**: Chat interface for exam clarification and tutoring
- **Progress Tracking**: Daily streaks, accuracy metrics, and study analytics
- **Admin Dashboard**: Question management, user oversight, and analytics
- **Subscription Model**: Free and Premium tiers with feature differentiation

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT (access: 15min, refresh: 7days)
- **Validation**: class-validator & class-transformer
- **API Docs**: [Scalar](https://scalar.com/) (modern API reference)
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd exam-test

# Install dependencies
pnpm install
```

### 2. Database Setup

```bash
# Create database
createdb -U postgres exam_preparation

# Run schema
psql -U postgres -d exam_preparation -f db/schema.sql

# Insert mock data (optional)
psql -U postgres -d exam_preparation -f db/insert.sql
```

### 3. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

Required environment variables:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=exam_preparation

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# AI (Optional - for AI features)
OPENAI_API_KEY=your-openai-key
```

### 4. Run the Application

```bash
# Development mode with hot reload
pnpm run start:dev

# Production build
pnpm run build
pnpm run start:prod
```

The API will be available at:
- **Base URL**: http://localhost:3001/api
- **API Documentation**: http://localhost:3001/api/docs (Scalar)

## API Structure

All API responses follow a consistent format:

### Success Response
```json
{
  "status": true,
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2025-02-11T10:30:00Z",
    "request_id": "uuid",
    "pagination": { ... }
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
    "message": "Validation failed",
    "details": [...]
  },
  "meta": { ... }
}
```

## Test Accounts

| Email | Password | Role | Subscription |
|-------|----------|------|--------------|
| admin@examprep.com | admin123 | Admin | Premium |
| emma.okonkwo@email.com | password123 | User | Premium |
| john.doe@email.com | password123 | User | Free |

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

db/
├── schema.sql           # Database DDL
├── insert.sql           # Mock data
└── README.md            # Database setup guide
```

## Available Scripts

```bash
# Development
pnpm run start:dev      # Start with hot reload

# Building
pnpm run build          # Build for production

# Testing
pnpm run test           # Run unit tests
pnpm run test:e2e       # Run end-to-end tests
pnpm run test:cov       # Test coverage

# Code quality
pnpm run lint           # Run ESLint
pnpm run format         # Format with Prettier
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/stats` - User statistics

### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/:slug` - Get course details
- `POST /api/courses/:id/enroll` - Enroll in course
- `PUT /api/courses/:id/progress` - Update progress

### Practice (Coming Soon)
- `POST /api/practice/start` - Start practice session
- `POST /api/practice/:id/answer` - Submit answer
- `POST /api/practice/:id/submit` - Complete session

### Admin (Coming Soon)
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List users
- `GET /api/admin/questions` - Manage questions

## Implementation Status

### ✅ Completed
- Project setup with NestJS
- Common utilities (interceptors, filters, guards, decorators)
- Database configuration with TypeORM
- User authentication (JWT)
- Users module (profile management)
- Courses module (CRUD, enrollment, progress)
- Database schema and mock data
- Scalar API documentation

### 🚧 In Progress
- Questions module
- Practice sessions
- Progress analytics
- AI integration
- Admin dashboard

## Deployment

### Vercel (Serverless)

This application is configured for deployment to Vercel's serverless platform.

Quick deploy:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

**Requirements:**
- PostgreSQL database (Vercel Postgres, Supabase, Railway, etc.)
- Environment variables configured in Vercel dashboard

## License

[MIT](LICENSE)

## Support

For support, please refer to the [AGENTS.md](AGENTS.md) file or open an issue.

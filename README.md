# Exam Preparation Platform - Backend API

A comprehensive backend API for an exam preparation platform with AI-powered study assistance, practice tests, mock exams, and progress tracking.

## Quick Reference

- **Start Development**: `pnpm start:dev`
- **Build**: `pnpm build`
- **Database**: PostgreSQL (name: `exam`)
- **Update Schema**: `psql -U postgres -d exam -f db/schema.sql`
- **Documentation**: Available via Scalar at `/reference` endpoint

---

## Table of Contents

1. [Authentication](#authentication)
2. [Courses](#courses)
3. [Focused Practice](#focused-practice)
4. [Progress & Analytics](#progress--analytics)
5. [Goals & Milestones](#goals--milestones)
6. [Events](#events)
7. [Study Materials](#study-materials)
8. [AI Study Chat](#ai-study-chat)
9. [Discussions](#discussions)
10. [Notifications](#notifications)
11. [Subscriptions](#subscriptions)
12. [Chat Support](#chat-support)
13. [Users](#users)
14. [Search History](#search-history)
15. [Upload](#upload)
16. [Domain Reference](#domain-reference)
17. [Admin - Dashboard](#admin---dashboard)
18. [Admin - Users](#admin---users)
19. [Admin - Questions](#admin---questions)
20. [Admin - Settings](#admin---settings)
21. [Password Reset](#password-reset)

---

## Authentication

### Register

```http
POST /api/auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "John Doe",
  "role": "user"
}
```

**Response (201):**

```json
{
  "status": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "tokens": {
      "access_token": "eyJ...",
      "refresh_token": "eyJ..."
    }
  }
}
```

---

### Login

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "rememberMe": false
}
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "subscriptionTier": "free"
    },
    "tokens": {
      "access_token": "eyJ...",
      "refresh_token": "eyJ..."
    }
  }
}
```

---

### Refresh Token

```http
POST /api/auth/refresh
```

**Request Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "rememberMe": false
}
```

**Response (200):**

```json
{
  "tokens": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ..."
  }
}
```

---

### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": null,
    "subscriptionTier": "free",
    "createdAt": "2026-03-21T10:00:00Z"
  }
}
```

---

### Logout

```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

**Response (204):** No Content

---

## Courses

### Get All Courses

```http
GET /api/courses
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20) |
| category | string | No | Filter by category (MEDICAL, NURSING, PHARMACY, ENGINEERING, LAW, BUSINESS, IT) |
| difficulty | string | No | Filter by difficulty |
| search | string | No | Search term |
| sortBy | string | No | Sort field (name, created_at, title) |
| sortOrder | string | No | ASC or DESC |

**Response (200):**

```json
{
  "status": true,
  "data": [
    {
      "id": "uuid",
      "title": "PLAB Medical Preparation",
      "slug": "plab-medical-preparation",
      "description": "Comprehensive PLAB exam preparation...",
      "category": "MEDICAL",
      "difficultyLevel": "intermediate",
      "totalDurationHours": 40,
      "enrollmentCount": 250,
      "thumbnailUrl": null,
      "isEnrolled": false
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

---

### Get Course by Slug

```http
GET /api/courses/:slug
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "title": "PLAB Medical Preparation",
    "slug": "plab-medical-preparation",
    "description": "Comprehensive PLAB exam preparation...",
    "category": "MEDICAL",
    "difficultyLevel": "intermediate",
    "totalDurationHours": 40,
    "enrollmentCount": 250,
    "isEnrolled": true,
    "progress": {
      "progressPercentage": 45,
      "completedTopics": 18,
      "totalTopics": 40,
      "timeSpentMinutes": 1200
    }
  }
}
```

---

### Enroll in Course

```http
POST /api/courses/:id/enroll
Authorization: Bearer <access_token>
```

**Response (201):**

```json
{
  "status": true,
  "data": {
    "message": "Successfully enrolled",
    "enrollment": {
      "courseId": "uuid",
      "enrolledAt": "2026-03-21T10:00:00Z",
      "progressPercentage": 0
    }
  }
}
```

---

### Update Course Progress

```http
PUT /api/courses/:id/progress
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "progressPercentage": 50,
  "timeSpentMinutes": 30,
  "completedTopics": 5
}
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "courseId": "uuid",
    "progressPercentage": 50,
    "timeSpentMinutes": 1230,
    "completedTopics": 5,
    "lastAccessedAt": "2026-03-21T10:30:00Z"
  }
}
```

---

### Create Course (Admin)

```http
POST /api/courses
Authorization: Bearer <access_token> (Admin only)
```

**Request Body:**

```json
{
  "title": "Advanced Mathematics",
  "description": "Comprehensive math course",
  "category": "ENGINEERING",
  "difficultyLevel": "advanced",
  "totalDurationHours": 60
}
```

**Response (201):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "title": "Advanced Mathematics",
    "slug": "advanced-mathematics",
    "category": "ENGINEERING",
    "createdAt": "2026-03-21T10:00:00Z"
  }
}
```

---

## Focused Practice

### Get Courses for Practice

```http
GET /api/focused-practice/courses
```

**Response (200):**

```json
{
  "courses": [
    {
      "id": "uuid",
      "title": "PLAB Medical Preparation",
      "questionCount": 500
    }
  ]
}
```

---

### Get Difficulty Options

```http
GET /api/focused-practice/difficulties
```

**Response (200):**

```json
{
  "difficulties": [
    { "value": "easy", "label": "Easy", "color": "#22c55e" },
    { "value": "medium", "label": "Medium", "color": "#eab308" },
    { "value": "hard", "label": "Hard", "color": "#ef4444" }
  ]
}
```

---

### Get Question Count Options

```http
GET /api/focused-practice/question-counts
```

**Response (200):**

```json
[10, 20, 50]
```

---

### Start Practice Session

```http
POST /api/focused-practice/start
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "courseId": "uuid",
  "difficulty": "medium",
  "questionCount": 20
}
```

**Response (201):**

```json
{
  "status": true,
  "data": {
    "sessionId": "uuid",
    "courseId": "uuid",
    "totalQuestions": 20,
    "currentQuestionNumber": 1,
    "timeSpentSeconds": 0,
    "status": "in_progress",
    "questions": [
      {
        "id": "uuid",
        "number": 1,
        "questionText": "What is the primary function of the heart?",
        "options": [
          { "id": "a", "text": "Pumping blood" },
          { "id": "b", "text": "Filtering toxins" },
          { "id": "c", "text": "Producing hormones" },
          { "id": "d", "text": "Storing oxygen" }
        ],
        "isAnswered": false,
        "selectedAnswer": null,
        "isCorrect": null
      }
    ],
    "progress": {
      "answered": 0,
      "correct": 0,
      "remaining": 20,
      "percentage": 0
    }
  }
}
```

---

### Get Session Status

```http
GET /api/focused-practice/session/:sessionId
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "sessionId": "uuid",
    "currentQuestionNumber": 5,
    "totalQuestions": 20,
    "answered": 4,
    "correct": 3,
    "accuracy": 75.0,
    "timeSpentSeconds": 300,
    "status": "in_progress",
    "isComplete": false
  }
}
```

---

### Get Current Question

```http
GET /api/focused-practice/session/:sessionId/question
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "number": 5,
    "totalQuestions": 20,
    "questionText": "What is the primary function of the heart?",
    "options": [
      { "id": "a", "text": "Pumping blood" },
      { "id": "b", "text": "Filtering toxins" }
    ],
    "isAnswered": false,
    "selectedAnswer": null,
    "isCorrect": null
  }
}
```

---

### Submit Answer

```http
POST /api/focused-practice/session/:sessionId/answer
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "answer": "a"
}
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "number": 5,
    "selectedAnswer": "a",
    "isCorrect": true,
    "explanation": "The heart's primary function is to pump blood...",
    "isAnswered": true
  }
}
```

---

### Navigate to Next Question

```http
POST /api/focused-practice/session/:sessionId/next
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "questionNumber": 6
}
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "number": 6,
    "questionText": "...",
    "options": [...],
    "isAnswered": false,
    "selectedAnswer": null
  }
}
```

---

### Navigate to Previous Question

```http
POST /api/focused-practice/session/:sessionId/previous
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "number": 5,
    "questionText": "...",
    "options": [...],
    "isAnswered": true,
    "selectedAnswer": "a"
  }
}
```

---

### Complete Session

```http
POST /api/focused-practice/session/:sessionId/complete
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "sessionId": "uuid",
    "courseId": "uuid",
    "totalQuestions": 20,
    "answered": 20,
    "correct": 16,
    "accuracy": 80.0,
    "timeSpentSeconds": 1200,
    "status": "completed",
    "completedAt": "2026-03-21T10:30:00Z",
    "questions": [
      {
        "number": 1,
        "questionText": "...",
        "selectedAnswer": "a",
        "isCorrect": true
      }
    ],
    "results": {
      "passed": true,
      "grade": "B+",
      "summary": "Great job! You demonstrated solid understanding..."
    }
  }
}
```

---

## Progress & Analytics

### Get Study Trends

```http
GET /api/progress/study-trends
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "weeklyTrends": [
      {
        "week": "2026-W17",
        "questionsAnswered": 225,
        "correctAnswers": 198,
        "accuracy": 88.0,
        "hoursSpent": 13.2
      }
    ],
    "dailyActivity": [
      {
        "date": "2026-03-21",
        "questionsAnswered": 30,
        "hoursSpent": 1.6,
        "sessionsCompleted": 2
      }
    ],
    "weeklyHours": [
      {
        "week": "2026-W17",
        "hours": 13.2
      }
    ]
  }
}
```

---

### Get Weekly Hours Summary

```http
GET /api/progress/weekly-hours-summary
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "weeks": [{ "week": "2026-W17", "hours": 13.2 }],
    "totalHours": 72.7
  }
}
```

---

### Get Overall Performance

```http
GET /api/progress/overall
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "totalQuestionsAnswered": 1670,
    "totalCorrectAnswers": 1390,
    "overallAccuracy": 83.2,
    "totalHoursStudied": 72.7,
    "totalSessionsCompleted": 45,
    "currentStreak": 7,
    "longestStreak": 14,
    "subjectPerformance": [
      {
        "courseId": "uuid",
        "courseName": "Pharmacology",
        "questionsAnswered": 450,
        "correctAnswers": 378,
        "accuracy": 84.0
      }
    ],
    "recentSessions": [
      {
        "id": "uuid",
        "courseTitle": "PLAB Prep",
        "score": 85,
        "completedAt": "2026-03-21T10:30:00Z"
      }
    ]
  }
}
```

---

### Get Streak Info

```http
GET /api/progress/streak
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "currentStreak": 7,
    "longestStreak": 14,
    "lastPracticeDate": "2026-03-21",
    "weeklyActivity": [
      { "date": "2026-03-21", "practiced": true },
      { "date": "2026-03-20", "practiced": true }
    ]
  }
}
```

---

## Goals & Milestones

### Get All Milestones

```http
GET /api/goals/milestones
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "milestones": [
      {
        "id": "uuid",
        "name": "First Steps",
        "description": "Answer your first question",
        "icon": "🎯",
        "type": "questions_answered",
        "threshold": 1,
        "rarity": "bronze",
        "isEarned": true
      },
      {
        "id": "uuid",
        "name": "Question Master",
        "description": "Answer 500 questions",
        "icon": "🏆",
        "type": "questions_answered",
        "threshold": 500,
        "rarity": "gold",
        "isEarned": false
      }
    ],
    "earnedCount": 3,
    "totalCount": 14
  }
}
```

---

### Get User Earned Milestones

```http
GET /api/goals/milestones/earned
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": [
    {
      "id": "uuid",
      "milestone": {
        "id": "uuid",
        "name": "First Steps",
        "icon": "🎯",
        "type": "questions_answered",
        "rarity": "bronze"
      },
      "earnedAt": "2026-03-21T10:00:00Z"
    }
  ]
}
```

---

### Get User Goals

```http
GET /api/goals
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": [
    {
      "id": "uuid",
      "name": "Daily Practice",
      "goalType": "daily_questions",
      "period": "daily",
      "targetValue": 20,
      "currentValue": 15,
      "progressPercentage": 75,
      "isCompleted": false
    }
  ]
}
```

---

### Create Goal

```http
POST /api/goals
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "name": "Daily Practice",
  "goalType": "daily_questions",
  "period": "daily",
  "targetValue": 20,
  "description": "Practice 20 questions every day"
}
```

**Response (201):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "name": "Daily Practice",
    "goalType": "daily_questions",
    "period": "daily",
    "targetValue": 20,
    "currentValue": 0,
    "progressPercentage": 0,
    "isCompleted": false,
    "periodStart": "2026-03-21",
    "periodEnd": "2026-03-21"
  }
}
```

---

### Update Goal

```http
PUT /api/goals/:id
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "targetValue": 25,
  "description": "Updated target"
}
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "targetValue": 25,
    "currentValue": 15,
    "progressPercentage": 60
  }
}
```

---

### Delete Goal

```http
DELETE /api/goals/:id
Authorization: Bearer <access_token>
```

**Response (204):** No Content

---

## Events

### Get All Events

```http
GET /api/events
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20) |
| eventType | string | No | zoom or physical |
| search | string | No | Search term |
| upcomingOnly | boolean | No | Filter upcoming events only |

**Response (200):**

```json
{
  "status": true,
  "data": [
    {
      "id": "uuid",
      "eventType": "zoom",
      "title": "Pass Exams Like a Pro",
      "description": "Join us for an intensive exam prep session...",
      "eventDate": "2025-01-21T21:00:00Z",
      "location": null,
      "zoomLink": "https://zoom.us/j/123456789",
      "maxAttendees": 100,
      "registeredCount": 45,
      "isActive": true,
      "isRegistered": false,
      "spotsRemaining": 55
    }
  ],
  "meta": {
    "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
  }
}
```

---

### Get Event by ID

```http
GET /api/events/:id
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "eventType": "zoom",
    "title": "Pass Exams Like a Pro",
    "description": "...",
    "eventDate": "2025-01-21T21:00:00Z",
    "zoomLink": "https://zoom.us/j/123456789",
    "maxAttendees": 100,
    "registeredCount": 45,
    "isActive": true,
    "isRegistered": true,
    "spotsRemaining": 55
  }
}
```

---

### Get My Registrations

```http
GET /api/events/my-registrations
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": [
    {
      "id": "uuid",
      "eventId": "uuid",
      "eventTitle": "Pass Exams Like a Pro",
      "eventType": "zoom",
      "eventDate": "2025-01-21T21:00:00Z",
      "zoomLink": "https://zoom.us/j/123456789",
      "isConfirmed": true,
      "registeredAt": "2026-03-15T14:30:00Z"
    }
  ]
}
```

---

### Create Event (Admin)

```http
POST /api/events
Authorization: Bearer <access_token> (Admin only)
```

**Request Body:**

```json
{
  "eventType": "zoom",
  "title": "Pass Exams Like a Pro",
  "description": "Join us for an intensive exam prep session...",
  "eventDate": "2025-01-21T21:00:00Z",
  "zoomLink": "https://zoom.us/j/123456789",
  "maxAttendees": 100
}
```

**Response (201):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "eventType": "zoom",
    "title": "Pass Exams Like a Pro",
    "eventDate": "2025-01-21T21:00:00Z"
  }
}
```

---

### Update Event (Admin)

```http
PUT /api/events/:id
Authorization: Bearer <access_token> (Admin only)
```

**Request Body:**

```json
{
  "title": "Updated Title",
  "maxAttendees": 150
}
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "title": "Updated Title",
    "maxAttendees": 150
  }
}
```

---

### Delete Event (Admin)

```http
DELETE /api/events/:id
Authorization: Bearer <access_token> (Admin only)
```

**Response (204):** No Content

---

### Register for Event

```http
POST /api/events/:id/register
Authorization: Bearer <access_token>
```

**Response (201):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "eventId": "uuid",
    "isConfirmed": true,
    "registeredAt": "2026-03-21T10:00:00Z"
  }
}
```

---

### Cancel Registration

```http
DELETE /api/events/:id/register
Authorization: Bearer <access_token>
```

**Response (204):** No Content

---

## Study Materials

### Get All Materials

```http
GET /api/study-materials
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20) |
| courseId | string | No | Filter by course |
| search | string | No | Search term |

**Response (200):**

```json
{
  "status": true,
  "data": [
    {
      "id": "uuid",
      "title": "Cardiology Fundamentals",
      "description": "Essential concepts in cardiology...",
      "content": "...",
      "fileUrl": "https://example.com/materials/cardiology.pdf",
      "courseId": "uuid",
      "course": { "id": "uuid", "title": "PLAB Prep" },
      "createdBy": "uuid",
      "createdAt": "2026-03-21T10:00:00Z",
      "reactionCount": 25,
      "averageRating": 4.5
    }
  ],
  "meta": {
    "pagination": { "page": 1, "limit": 20, "total": 10, "totalPages": 1 }
  }
}
```

---

### Get Material by ID

```http
GET /api/study-materials/:id
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "title": "Cardiology Fundamentals",
    "description": "Essential concepts in cardiology...",
    "content": "...",
    "fileUrl": "https://example.com/materials/cardiology.pdf",
    "courseId": "uuid",
    "reactionCount": 25,
    "averageRating": 4.5,
    "createdAt": "2026-03-21T10:00:00Z"
  }
}
```

---

### Create Material (Admin)

```http
POST /api/study-materials
Authorization: Bearer <access_token> (Admin only)
```

**Request Body:**

```json
{
  "title": "New Study Material",
  "description": "Description...",
  "content": "Full content...",
  "courseId": "uuid",
  "fileUrl": "https://example.com/file.pdf"
}
```

**Response (201):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "title": "New Study Material"
  }
}
```

---

### Update Material (Admin)

```http
PUT /api/study-materials/:id
Authorization: Bearer <access_token> (Admin only)
```

**Request Body:**

```json
{
  "title": "Updated Title"
}
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "title": "Updated Title"
  }
}
```

---

### Delete Material (Admin)

```http
DELETE /api/study-materials/:id
Authorization: Bearer <access_token> (Admin only)
```

**Response (204):** No Content

---

### Add Reaction

```http
POST /api/study-materials/:id/react
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "reactionCount": 26
  }
}
```

---

### Rate Material

```http
POST /api/study-materials/:id/rate
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "rating": 5
}
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "averageRating": 4.6
  }
}
```

---

## AI Study Chat

### Send Message

```http
POST /api/ai-chat
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "prompt": "How do I prepare for the PLAB exam?"
}
```

**Response (200):**

```json
{
  "reply": "That's an excellent question! Let me help you prepare for the PLAB exam. Here are some key strategies...",
  "sessionId": "uuid",
  "messageCount": 2
}
```

---

### Get All Sessions

```http
GET /api/ai-chat/sessions
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": [
    {
      "id": "uuid",
      "title": "PLAB Exam Preparation",
      "messageCount": 5,
      "lastMessage": "Thank you for the advice!",
      "createdAt": "2026-03-21T10:00:00Z"
    }
  ]
}
```

---

### Get Session History

```http
GET /api/ai-chat/sessions/:sessionId
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "title": "PLAB Exam Preparation",
    "messages": [
      {
        "id": "uuid",
        "role": "user",
        "content": "How do I prepare for PLAB?",
        "createdAt": "2026-03-21T10:00:00Z"
      },
      {
        "id": "uuid",
        "role": "assistant",
        "content": "Here are some tips...",
        "createdAt": "2026-03-21T10:00:30Z"
      }
    ]
  }
}
```

---

## Discussions

### Get All Posts

```http
GET /api/discussions
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20) |
| courseId | string | No | Filter by course |
| tag | string | No | Filter by tag |
| search | string | No | Search term |

**Response (200):**

```json
{
  "status": true,
  "data": [
    {
      "id": "uuid",
      "title": "How to prepare for PLAB?",
      "content": "I have been preparing for...",
      "author": { "id": "uuid", "name": "John Doe", "avatarUrl": null },
      "course": { "id": "uuid", "title": "PLAB Prep" },
      "tags": ["plab", "exam-prep"],
      "views": 150,
      "upvotes": 12,
      "isAnswered": true,
      "answerCount": 5,
      "createdAt": "2026-03-21T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
  }
}
```

---

### Get Post by ID

```http
GET /api/discussions/:id
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "title": "How to prepare for PLAB?",
    "content": "I have been preparing for...",
    "author": { "id": "uuid", "name": "John Doe", "avatarUrl": null },
    "course": { "id": "uuid", "title": "PLAB Prep" },
    "tags": ["plab", "exam-prep"],
    "views": 151,
    "upvotes": 12,
    "isAnswered": true,
    "answers": [
      {
        "id": "uuid",
        "content": "Here are my tips...",
        "author": { "id": "uuid", "name": "Jane Doe" },
        "isAccepted": true,
        "upvotes": 5,
        "createdAt": "2026-03-21T11:00:00Z"
      }
    ],
    "createdAt": "2026-03-21T10:00:00Z"
  }
}
```

---

### Create Post

```http
POST /api/discussions
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "title": "How to prepare for PLAB?",
  "content": "I have been preparing for the PLAB exam...",
  "courseId": "uuid",
  "tags": ["plab", "exam-prep"]
}
```

**Response (201):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "title": "How to prepare for PLAB?",
    "createdAt": "2026-03-21T10:00:00Z"
  }
}
```

---

### Update Post

```http
PUT /api/discussions/:id
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "title": "Updated Title",
    "updatedAt": "2026-03-21T11:00:00Z"
  }
}
```

---

### Delete Post

```http
DELETE /api/discussions/:id
Authorization: Bearer <access_token>
```

**Response (204):** No Content

---

### Post Answer

```http
POST /api/discussions/:id/answers
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "content": "Here are my tips for preparing for the PLAB exam..."
}
```

**Response (201):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "content": "Here are my tips...",
    "author": { "id": "uuid", "name": "Jane Doe" },
    "createdAt": "2026-03-21T11:00:00Z"
  }
}
```

---

### Accept Answer

```http
POST /api/discussions/:id/answers/:answerId/accept
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "isAccepted": true
  }
}
```

---

### Upvote Post

```http
POST /api/discussions/:id/upvote
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "upvotes": 13
  }
}
```

---

### Comment on Post

```http
POST /api/discussions/:id/comments
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "content": "Great question!"
}
```

**Response (201):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "content": "Great question!"
  }
}
```

---

## Notifications

### Get Notifications

```http
GET /api/notifications
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": [
    {
      "id": "uuid",
      "title": "Welcome to ExamPrep!",
      "messagePreview": "Your account has been successfully created...",
      "tag": "system",
      "isRead": false,
      "actionUrl": "/dashboard",
      "createdAt": "2026-03-21T10:30:00.000Z"
    }
  ],
  "meta": {
    "unreadCount": 2,
    "total": 3
  }
}
```

---

### Create Notification (Admin)

```http
POST /api/notifications
Authorization: Bearer <access_token> (Admin only)
```

**Request Body:**

```json
{
  "userId": "uuid",
  "title": "New Course Available",
  "message": "A new PLAB preparation course has been added...",
  "tag": "course",
  "actionUrl": "/courses/plab-preparation"
}
```

**Response (201):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "title": "New Course Available",
    "tag": "course",
    "isRead": false,
    "createdAt": "2026-03-21T10:30:00.000Z"
  }
}
```

---

### Mark as Read

```http
PUT /api/notifications/:id/read
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "isRead": true
  }
}
```

---

### Mark All as Read

```http
PUT /api/notifications/read-all
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "updatedCount": 5
  }
}
```

---

### Delete Notification

```http
DELETE /api/notifications/:id
Authorization: Bearer <access_token>
```

**Response (204):** No Content

---

## Subscriptions

### Get Plans

```http
GET /api/subscriptions/plans
```

**Response (200):**

```json
{
  "status": true,
  "data": [
    {
      "id": "plan_free",
      "name": "Free",
      "price": 0,
      "billingCycle": "forever",
      "description": "Get started with basic exam preparation features.",
      "features": [
        { "feature": "Access to 5 courses", "included": true },
        { "feature": "Unlimited courses", "included": false }
      ]
    },
    {
      "id": "plan_paid",
      "name": "Paid",
      "price": 10,
      "billingCycle": "monthly",
      "description": "Full access to all exam preparation features.",
      "features": [
        { "feature": "Unlimited courses", "included": true },
        { "feature": "Mock exams", "included": true }
      ],
      "isPopular": true
    }
  ]
}
```

---

### Get My Subscription

```http
GET /api/subscriptions/my
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "planType": "paid",
    "billingCycle": "monthly",
    "startedAt": "2026-03-01T00:00:00.000Z",
    "expiresAt": "2026-04-01T00:00:00.000Z",
    "isActive": true,
    "plan": {
      "name": "Paid",
      "features": ["Unlimited courses", "Mock exams", "AI study assistant"]
    }
  }
}
```

---

### Subscribe

```http
POST /api/subscriptions/subscribe
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "planId": "plan_paid"
}
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "planType": "paid",
    "billingCycle": "monthly",
    "startedAt": "2026-03-21T10:30:00.000Z",
    "expiresAt": "2026-04-21T10:30:00.000Z",
    "isActive": true,
    "plan": {
      "name": "Paid",
      "features": ["Unlimited courses", "Mock exams"]
    }
  }
}
```

---

### Cancel Subscription

```http
PUT /api/subscriptions/cancel
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "planType": "free",
    "billingCycle": null,
    "expiresAt": "2026-03-21T10:30:00.000Z",
    "isActive": false,
    "plan": {
      "name": "Free",
      "features": ["Access to 5 courses", "Basic progress tracking"]
    }
  }
}
```

---

## Chat Support

### Create Ticket

```http
POST /api/support/tickets
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "subject": "Can't access course materials",
  "message": "I'm having trouble accessing the course materials..."
}
```

**Response (201):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "subject": "Can't access course materials",
    "status": "open",
    "createdAt": "2026-03-21T10:00:00Z"
  }
}
```

---

### Get My Tickets

```http
GET /api/support/tickets
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": [
    {
      "id": "uuid",
      "subject": "Can't access course materials",
      "status": "open",
      "lastMessage": "Thank you for reaching out...",
      "createdAt": "2026-03-21T10:00:00Z"
    }
  ]
}
```

---

### Get Conversation

```http
GET /api/support/tickets/:ticketId
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "subject": "Can't access course materials",
    "status": "open",
    "messages": [
      {
        "id": "uuid",
        "senderId": "uuid",
        "senderRole": "user",
        "content": "I'm having trouble...",
        "createdAt": "2026-03-21T10:00:00Z"
      },
      {
        "id": "uuid",
        "senderId": "admin-uuid",
        "senderRole": "admin",
        "content": "Thank you for reaching out...",
        "createdAt": "2026-03-21T10:30:00Z"
      }
    ]
  }
}
```

---

### Send Message

```http
POST /api/support/tickets/:ticketId/messages
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "message": "Thank you for the help!"
}
```

**Response (201):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "content": "Thank you for the help!",
    "senderRole": "user",
    "createdAt": "2026-03-21T11:00:00Z"
  }
}
```

---

### Close Ticket

```http
POST /api/support/tickets/:ticketId/close
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "status": "closed"
  }
}
```

---

## Users

### Get Profile

```http
GET /api/users/profile
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": null,
    "subscriptionTier": "free",
    "createdAt": "2026-03-01T10:00:00Z"
  }
}
```

---

### Update Profile

```http
PUT /api/users/profile
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "name": "John Updated",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "name": "John Updated",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}
```

---

### Get User Stats

```http
GET /api/users/stats
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "totalCoursesEnrolled": 3,
    "totalQuestionsAnswered": 450,
    "overallAccuracy": 78.5,
    "totalStudyHours": 25.5,
    "currentStreak": 7,
    "longestStreak": 14
  }
}
```

---

## Search History

### Get Recent Searches

```http
GET /api/search-history
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "status": true,
  "data": ["Cardiology", "Pharmacology", "Anatomy"]
}
```

---

### Add Search

```http
POST /api/search-history
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "query": "Cardiology",
  "type": "course"
}
```

**Response (201):**

```json
{
  "status": true,
  "data": null
}
```

---

### Clear History

```http
DELETE /api/search-history
Authorization: Bearer <access_token>
```

**Response (204):** No Content

---

### Delete Specific Search

```http
DELETE /api/search-history/:query
Authorization: Bearer <access_token>
```

**Response (204):** No Content

---

## Upload

### Upload Avatar

```http
POST /api/upload/avatar
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Data:**

```
file: <image file>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "url": "https://example.com/avatars/user-id/abc123.jpg",
    "key": "avatars/user-id/abc123.jpg"
  }
}
```

---

### Upload Material

```http
POST /api/upload/material
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Data:**

```
file: <file>
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "url": "https://example.com/materials/user-id/document.pdf",
    "key": "materials/user-id/document.pdf"
  }
}
```

---

## Domain Reference

### Get Professions

```http
GET /api/domain/professions
```

**Response (200):**

```json
[
  {
    "id": "uuid",
    "name": "Medical Doctor",
    "description": "Professional medical practitioners",
    "isActive": true
  }
]
```

---

### Get Sectors

```http
GET /api/domain/sectors
```

**Response (200):**

```json
[
  {
    "id": "uuid",
    "name": "Healthcare",
    "description": "Healthcare sector",
    "isActive": true
  }
]
```

---

### Get Exam Types

```http
GET /api/domain/exam-types
GET /api/domain/exam-types?sectorId=uuid
```

**Response (200):**

```json
[
  {
    "id": "uuid",
    "name": "PLAB",
    "description": "Professional and Linguistic Assessments Board",
    "sectorId": "uuid",
    "isActive": true
  }
]
```

---

## Admin - Auth

### Register Admin

```http
POST /api/admin/auth/register
```

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "AdminPassword123!",
  "name": "Admin User"
}
```

**Response (201):**

```json
{
  "status": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin"
    },
    "tokens": {
      "access_token": "eyJ...",
      "refresh_token": "eyJ..."
    }
  }
}
```

---

### Admin Login

```http
POST /api/admin/auth/login
```

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "AdminPassword123!"
}
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin"
    },
    "tokens": {
      "access_token": "eyJ...",
      "refresh_token": "eyJ..."
    }
  }
}
```

---

## Admin - Dashboard

### Get Metrics

```http
GET /api/admin/dashboard/metrics
Authorization: Bearer <access_token> (Admin only)
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "totalQuestions": 28400,
    "registeredUsers": 400,
    "premiumUsers": 98,
    "averageScore": 69,
    "totalPracticeSessions": 1250,
    "totalDiscussions": 340,
    "totalAnswers": 890,
    "activeCourses": 12,
    "weeklyNewUsers": 25,
    "weeklyNewQuestions": 150,
    "topSubjects": [
      { "name": "Cardiology", "accuracy": 72, "questionsAnswered": 2500 }
    ],
    "recentActivity": [
      {
        "type": "discussion",
        "description": "New discussion: \"How to prepare for...\"",
        "timestamp": "2026-03-21T10:00:00Z"
      }
    ]
  }
}
```

---

### Get Weekly Stats

```http
GET /api/admin/dashboard/weekly-stats
Authorization: Bearer <access_token> (Admin only)
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "weeklyPracticeSessions": 150,
    "weeklyQuestionsAdded": 25,
    "sessionsByDay": {
      "2026-03-17": 25,
      "2026-03-18": 30
    }
  }
}
```

---

## Admin - Users

### Get All Users

```http
GET /api/admin/users
Authorization: Bearer <access_token> (Admin only)
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number |
| limit | number | No | Items per page |
| search | string | No | Search term |
| status | string | No | active or suspended |

**Response (200):**

```json
{
  "status": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "subscriptionTier": "free",
      "isActive": true,
      "createdAt": "2026-03-01T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": { "page": 1, "limit": 20, "total": 400, "totalPages": 20 }
  }
}
```

---

### Update User Status

```http
PUT /api/admin/users/:id/status
Authorization: Bearer <access_token> (Admin only)
```

**Request Body:**

```json
{
  "status": "suspended"
}
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "isActive": false
  }
}
```

---

## Admin - Questions

### Get All Questions

```http
GET /api/admin/questions
Authorization: Bearer <access_token> (Admin only)
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number |
| limit | number | No | Items per page |
| courseId | string | No | Filter by course |
| difficulty | string | No | easy, medium, or hard |
| topic | string | No | Filter by topic |
| search | string | No | Search term |
| isFlagged | boolean | No | Filter flagged questions |

**Response (200):**

```json
{
  "status": true,
  "data": [
    {
      "id": "uuid",
      "questionText": "What is the primary function of the heart?",
      "fullQuestionText": "What is the primary function of the heart?",
      "course": { "id": "uuid", "title": "PLAB Prep" },
      "difficulty": "medium",
      "topic": "Cardiology",
      "isFlagged": false,
      "questionType": "single_choice",
      "createdAt": "2026-03-21T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": { "page": 1, "limit": 20, "total": 28400, "totalPages": 1420 }
  }
}
```

---

### Get Question by ID

```http
GET /api/admin/questions/:id
Authorization: Bearer <access_token> (Admin only)
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "questionText": "What is the primary function of the heart?",
    "options": [
      { "id": "a", "text": "Pumping blood" },
      { "id": "b", "text": "Filtering toxins" }
    ],
    "correctAnswer": "a",
    "explanation": "The heart's primary function is to pump blood...",
    "difficulty": "medium",
    "topic": "Cardiology",
    "course": { "id": "uuid", "title": "PLAB Prep" },
    "isFlagged": false,
    "createdAt": "2026-03-21T10:00:00Z"
  }
}
```

---

### Create Question

```http
POST /api/admin/questions
Authorization: Bearer <access_token> (Admin only)
```

**Request Body:**

```json
{
  "courseId": "uuid",
  "questionText": "What is the primary function of the heart?",
  "options": [
    { "id": "a", "text": "Pumping blood" },
    { "id": "b", "text": "Filtering toxins" },
    { "id": "c", "text": "Producing hormones" },
    { "id": "d", "text": "Storing oxygen" }
  ],
  "correctAnswer": "a",
  "explanation": "The heart's primary function is to pump blood...",
  "difficulty": "medium",
  "topic": "Cardiology",
  "questionType": "single_choice"
}
```

**Response (201):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "questionText": "What is the primary function of the heart?",
    "course": { "id": "uuid", "title": "PLAB Prep" },
    "difficulty": "medium",
    "topic": "Cardiology",
    "createdAt": "2026-03-21T10:00:00Z"
  }
}
```

---

### Update Question

```http
PUT /api/admin/questions/:id
Authorization: Bearer <access_token> (Admin only)
```

**Request Body:**

```json
{
  "difficulty": "hard",
  "explanation": "Updated explanation..."
}
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "difficulty": "hard",
    "updatedAt": "2026-03-21T11:00:00Z"
  }
}
```

---

### Delete Question

```http
DELETE /api/admin/questions/:id
Authorization: Bearer <access_token> (Admin only)
```

**Response (204):** No Content

---

### Flag Question

```http
POST /api/admin/questions/:id/flag
Authorization: Bearer <access_token> (Admin only)
```

**Request Body:**

```json
{
  "reason": "Incorrect answer option"
}
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "isFlagged": true,
    "flagReason": "Incorrect answer option"
  }
}
```

---

### Unflag Question

```http
POST /api/admin/questions/:id/unflag
Authorization: Bearer <access_token> (Admin only)
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "id": "uuid",
    "isFlagged": false
  }
}
```

---

### Get Flagged Questions

```http
GET /api/admin/questions/flagged
Authorization: Bearer <access_token> (Admin only)
```

**Response (200):**

```json
{
  "status": true,
  "data": [...],
  "meta": {
    "pagination": { "page": 1, "limit": 20, "total": 15, "totalPages": 1 }
  }
}
```

---

### Get Courses for Question Creation

```http
GET /api/admin/questions/courses
Authorization: Bearer <access_token> (Admin only)
```

**Response (200):**

```json
{
  "status": true,
  "data": [{ "id": "uuid", "title": "PLAB Prep", "category": "MEDICAL" }]
}
```

---

## Admin - Settings

### Get Settings

```http
GET /api/admin/settings
Authorization: Bearer <access_token> (Admin only)
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "platformName": "ExamPrep",
    "supportEmail": "support@examprep.com",
    "freePlanQuestions": 50,
    "freePlanTopics": 2,
    "paidPlanPrice": 10,
    "subscriptionBillingCycle": "monthly",
    "maintenanceMode": false,
    "maintenanceMessage": "We are currently under maintenance."
  }
}
```

---

### Update Settings

```http
PUT /api/admin/settings
Authorization: Bearer <access_token> (Admin only)
```

**Request Body:**

```json
{
  "platform_name": "ExamPrep Pro",
  "support_email": "help@examprep.com",
  "free_plan_questions": 100,
  "paid_plan_price": 15,
  "maintenance_mode": false
}
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "platformName": "ExamPrep Pro",
    "supportEmail": "help@examprep.com",
    "freePlanQuestions": 100,
    "paidPlanPrice": 15
  }
}
```

---

## Password Reset

### Forgot Password

```http
POST /api/auth/forgot-password
```

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "message": "If an account exists with this email, a password reset link will be sent."
  }
}
```

---

### Reset Password

```http
POST /api/auth/reset-password
```

**Request Body:**

```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewPassword123!"
}
```

**Response (200):**

```json
{
  "status": true,
  "data": {
    "message": "Password has been reset successfully."
  }
}
```

---

## Common Response Format

All API endpoints follow a consistent response format:

### Success Response

```json
{
  "status": true,
  "data": {
    /* response data */
  },
  "meta": {
    "timestamp": "2026-03-21T10:30:00Z",
    "request_id": "uuid"
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
    "details": [{ "field": "email", "message": "Email is required" }]
  },
  "meta": {
    "timestamp": "2026-03-21T10:30:00Z",
    "request_id": "uuid"
  }
}
```

---

## HTTP Status Codes

| Code | Description                            |
| ---- | -------------------------------------- |
| 200  | Success (GET, PUT)                     |
| 201  | Created (POST)                         |
| 204  | No Content (DELETE)                    |
| 400  | Bad Request - Validation error         |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Insufficient permissions   |
| 404  | Not Found - Resource not found         |
| 409  | Conflict - Resource conflict           |
| 500  | Internal Server Error                  |

---

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=exam

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASSWORD=password
SMTP_FROM_EMAIL=noreply@examprep.com
SMTP_FROM_NAME=ExamPrep

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# App
APP_URL=http://localhost:3001
PORT=3001
```

---

## Database Schema

Run the following to update the database schema:

```bash
psql -U postgres -d exam -f db/schema.sql
```

See `db/schema.sql` for complete database structure including all tables, indexes, and relationships.

---

## Test Accounts

| Email                  | Password    | Role  | Subscription |
| ---------------------- | ----------- | ----- | ------------ |
| admin@examprep.com     | admin123    | Admin | Premium      |
| emma.okonkwo@email.com | password123 | User  | Premium      |
| john.doe@email.com     | password123 | User  | Free         |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm

### Installation

```bash
# Clone repository
git clone <repository-url>
cd exam-test

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

### Database Setup

```bash
# Create database
createdb -U postgres exam

# Run schema
psql -U postgres -d exam -f db/schema.sql

# Insert mock data (optional)
psql -U postgres -d exam -f db/insert.sql
```

### Run the Application

```bash
# Development mode with hot reload
pnpm start:dev

# Production build
pnpm run build
pnpm run start:prod
```

The API will be available at:

- **Base URL**: http://localhost:3001/api
- **API Documentation**: http://localhost:3001/reference (Scalar)

---

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
├── focused-practice/     # Practice sessions
├── progress/            # Analytics & streaks
├── goals/              # Goals & milestones
├── events/             # Events management
├── study-materials/    # Learning materials
├── ai-chat/            # AI chat assistant
├── discussions/        # Peer review Q&A
├── notifications/      # User notifications
├── subscriptions/       # Subscription plans
├── chat-support/       # Support tickets
├── upload/             # File uploads
├── cache/              # Caching service
├── emails/             # Email service
├── domain/             # Domain reference data
└── admin/              # Admin operations

db/
├── schema.sql           # Database DDL
├── insert.sql          # Mock data
└── README.md          # Database setup guide
```

---

## Available Scripts

```bash
# Development
pnpm start:dev          # Start with hot reload

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

# Database Setup

This folder contains SQL files for setting up the exam preparation platform database.

## Files

- **schema.sql** - DDL statements to create all tables, enums, indexes, and triggers
- **insert.sql** - Mock data for testing and development

## Setup Instructions

### 1. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE exam_preparation;

# Exit
\q
```

### 2. Run Schema

```bash
# Run schema.sql
psql -U postgres -d exam_preparation -f db/schema.sql
```

### 3. Insert Mock Data

```bash
# Run insert.sql
psql -U postgres -d exam_preparation -f db/insert.sql
```

### 4. Verify Setup

```sql
-- Connect to database
psql -U postgres -d exam_preparation

-- Check tables
\dt

-- Check users
SELECT * FROM users;

-- Check courses
SELECT * FROM courses;

-- Exit
\q
```

## Default Test Accounts

| Email | Password | Role | Subscription |
|-------|----------|------|--------------|
| admin@examprep.com | admin123 | Admin | Premium |
| emma.okonkwo@email.com | password123 | User | Premium |
| john.doe@email.com | password123 | User | Free |
| sarah.smith@email.com | password123 | User | Premium |
| mike.johnson@email.com | password123 | User | Free |

## Database Schema Overview

### Tables

1. **users** - User accounts and authentication
2. **courses** - Exam subjects and study materials
3. **user_course_progress** - User enrollment and progress tracking
4. **questions** - Question bank with answers and explanations
5. **practice_sessions** - Practice test sessions (focused/mock)
6. **session_answers** - User responses during practice
7. **user_streaks** - Daily streak tracking for gamification
8. **ai_chat_sessions** - AI chat history

### Enums

- `subscription_tier`: free, premium
- `subscription_status`: active, cancelled, expired
- `course_category`: medical, technology, business, law, accounting, engineering, general
- `difficulty_level`: easy, medium, hard
- `session_type`: focused, mock_exam
- `session_status`: in_progress, completed, abandoned
- `question_type`: single_choice, multiple_choice

## Reset Database

To completely reset the database:

```bash
# Drop and recreate database
dropdb -U postgres exam_preparation
createdb -U postgres exam_preparation

# Re-run schema and data
psql -U postgres -d exam_preparation -f db/schema.sql
psql -U postgres -d exam_preparation -f db/insert.sql
```

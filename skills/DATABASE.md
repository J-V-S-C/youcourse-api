# YouCourse API - Database Schema

## Overview

The database is PostgreSQL managed by Prisma ORM. The schema defines all models, relationships, and constraints.

## Schema File

Location: `prisma/schema.prisma`

---

## Models

### Account

User accounts in the system.

```prisma
model Account {
  id                  String               @id @default(uuid())
  name                String
  email               String               @unique
  password            String
  status              AccountStatus        @default(ACTIVE)
  createdAt           DateTime             @default(now()) @map("created_at")
  lastLogin           DateTime?            @map("last_login")

  courses             Course[]
  passwordResetTokens PasswordResetToken[]
  rating              Rating[]
  refreshTokens       RefreshToken[]
}
```

**Fields:**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| name | String | required | User's display name |
| email | String | unique, required | User's email address |
| password | String | required | Bcrypt hashed password |
| status | Enum | default: ACTIVE | Account status |
| createdAt | DateTime | auto | Creation timestamp |
| lastLogin | DateTime | nullable | Last login timestamp |

**Status Values:**

```prisma
enum AccountStatus {
  ACTIVE     // Normal active account
  SUSPENDED  // Temporarily suspended
  DISABLED   // Permanently disabled
}
```

**Relationships:**

- One-to-Many with `Course` (creator)
- One-to-Many with `Rating`
- One-to-Many with `RefreshToken`
- One-to-Many with `PasswordResetToken`

---

### Course

Educational courses created by users.

```prisma
model Course {
  id          String         @id @default(uuid())
  creatorId   String         @map("account_id")
  name        String
  description String
  price       Json?
  visible     Boolean
  sellable    Boolean
  createdAt   DateTime       @default(now()) @map("created_at")
  updatedAt   DateTime?      @map("updated_at")

  creator     Account
  metrics     CourseMetrics?
  ratings     Rating[]
}
```

**Fields:**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| creatorId | UUID | FK to Account | Course owner |
| name | String | required | Course title |
| description | String | required | Course description |
| price | JSON | nullable | Price object `{amount, currency}` |
| visible | Boolean | required | Public visibility flag |
| sellable | Boolean | required | Available for purchase |
| createdAt | DateTime | auto | Creation timestamp |
| updatedAt | DateTime | nullable | Last update timestamp |

**Price Object Structure:**

```typescript
{
  amount: number; // Amount in smallest currency unit (cents)
  currency: string; // ISO currency code (e.g., 'BRL')
}
```

**Relationships:**

- Many-to-One with `Account` (creator)
- One-to-One with `CourseMetrics`
- One-to-Many with `Rating`

---

### Rating

User ratings and reviews for courses.

```prisma
model Rating {
  id         String    @id @default(uuid())
  creatorId  String    @map("account_id")
  courseId   String    @map("course_id")
  commentary String
  stars      Float
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime? @map("updated_at")

  creator    Account
  course     Course
}
```

**Fields:**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| creatorId | UUID | FK to Account | Rating author |
| courseId | UUID | FK to Course | Rated course |
| stars | Float | required | Rating value (0.5-5) |
| commentary | String | required | Review text |
| createdAt | DateTime | auto | Creation timestamp |
| updatedAt | DateTime | nullable | Last update timestamp |

**Validation Rules:**

- Stars: 0.5 to 5, increments of 0.5
- Commentary: max 255 characters

**Relationships:**

- Many-to-One with `Account` (creator)
- Many-to-One with `Course`

---

### CourseMetrics

Track course performance metrics.

```prisma
model CourseMetrics {
  courseId String @id
  views    Int
  clicks   Int
  sales    Int
  score    Float

  course   Course @relation(fields: [courseId], references: [id])
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| courseId | UUID | PK, FK to Course |
| views | Int | Number of views |
| clicks | Int | Number of clicks |
| sales | Int | Number of purchases |
| score | Float | Calculated rating score |

**Relationships:**

- One-to-One with `Course`

---

### PasswordResetToken

Tokens for password reset functionality.

```prisma
model PasswordResetToken {
  id        String    @id @default(uuid())
  token     String    @unique
  accountId String    @map("account_id")
  expiresAt DateTime  @map("expires_at")
  usedAt    DateTime? @map("used_at")

  account   Account  @relation(onDelete: Cascade)
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| token | String | Unique reset token |
| accountId | UUID | FK to Account |
| expiresAt | DateTime | Token expiration |
| usedAt | DateTime | When token was used |

**Behavior:**

- Cascade delete when account is deleted
- Token is single-use (marked after use)

---

### RefreshToken

JWT refresh tokens for session management.

```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  accountId String   @map("account_id")
  expiresAt DateTime @map("expires_at")

  account   Account  @relation(onDelete: Cascade)
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| token | String | Unique refresh token |
| accountId | UUID | FK to Account |
| expiresAt | DateTime | Token expiration |

**Behavior:**

- Cascade delete when account is deleted
- One active token per session
- Valid for 7 days

---

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐
│   Account    │       │    Course    │
├──────────────┤       ├──────────────┤
│ id (PK)      │───┐   │ id (PK)      │
│ name         │   │   │ creatorId(FK)│
│ email        │   └──►│ name         │
│ password     │       │ description  │
│ status       │       │ price (JSON) │
│ createdAt    │       │ visible      │
│ lastLogin    │       │ sellable     │
└──────────────┘       │ createdAt    │
       │               │ updatedAt    │
       │               └──────┬───────┘
       │                      │
       ▼                      ▼
┌──────────────┐       ┌──────────────┐
│ RefreshToken │       │CourseMetrics │
├──────────────┤       ├──────────────┤
│ id (PK)      │       │ courseId(PK) │
│ token        │       │ views        │
│ accountId(FK)│       │ clicks       │
│ expiresAt    │       │ sales        │
└──────────────┘       │ score        │
       │               └──────────────┘
       │
       ▼
┌────────────────────┐       ┌──────────────┐
│ PasswordResetToken │       │    Rating    │
├────────────────────┤       ├──────────────┤
│ id (PK)            │       │ id (PK)      │
│ token              │       │ creatorId(FK)│
│ accountId (FK)     │       │ courseId (FK)│
│ expiresAt          │       │ stars        │
│ usedAt             │       │ commentary   │
└────────────────────┘       │ createdAt    │
                             │ updatedAt    │
                             └──────────────┘
```

---

## Database Migrations

**Commands:**

```bash
# Create a new migration
pnpm prisma migrate dev --name add_courses

# Apply pending migrations
pnpm prisma migrate deploy

# Reset database (development only)
pnpm prisma migrate reset

# Generate Prisma client
pnpm prisma generate
```

---

## Indexes

Currently using default indexes on:

- `Account.email` - Unique index for login lookups
- `RefreshToken.token` - Unique index for token validation
- `PasswordResetToken.token` - Unique index for token validation
- Primary keys on all models

---

## Binary Targets

```prisma
generator client {
  binaryTargets = ["native", "linux-musl", "debian-openssl-3.0.x"]
}
```

Supports:

- Native execution
- Linux Alpine (musl)
- Debian with OpenSSL 3.0

---

## Environment Setup

**Docker Compose Connection:**

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: youcourse
      POSTGRES_USER: youcourse
      POSTGRES_PASSWORD: password
    ports:
      - 5432:5432
```

**Connection URL Format:**

```
postgresql://user:password@host:port/database
```

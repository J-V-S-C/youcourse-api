# YouCourse API - Quick Reference

## Project Summary

A NestJS-based online course platform API with PostgreSQL database, implementing Clean Architecture patterns, JWT authentication, and comprehensive CRUD operations for users, courses, and ratings.

## Technology Stack

| Category        | Technology             |
| --------------- | ---------------------- |
| Framework       | NestJS 11.x            |
| Language        | TypeScript 5.7         |
| Database        | PostgreSQL             |
| ORM             | Prisma 7.x             |
| Auth            | JWT (RS256) + Passport |
| Validation      | Zod                    |
| Testing         | Vitest                 |
| Package Manager | pnpm                   |

## Quick Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm start:dev           # Start with hot reload
pnpm build               # Build for production

# Database
pnpm prisma migrate dev  # Run migrations
pnpm prisma generate     # Generate client
pnpm prisma studio       # Open database GUI

# Testing
pnpm test                # Run unit tests
pnpm test:e2e            # Run E2E tests

# Code Quality
pnpm lint                # Run linter
```

## Key Files

| Path                      | Description             |
| ------------------------- | ----------------------- |
| `src/main.ts`             | Application entry point |
| `src/infra/app.module.ts` | Root module             |
| `prisma/schema.prisma`    | Database schema         |
| `.env`                    | Environment variables   |
| `docker-compose.yml`      | Docker services         |

## API Base URL

```
http://localhost:3333/api/v1
```

## Swagger Documentation

```
http://localhost:3333/api/docs
```

## Complete Endpoint List

### Public Endpoints

| Method | Endpoint                   | Description              |
| ------ | -------------------------- | ------------------------ |
| POST   | `/accounts`                | Register new account     |
| POST   | `/sessions`                | Login                    |
| POST   | `/sessions/refresh`        | Refresh tokens           |
| POST   | `/accounts/password-reset` | Request password reset   |
| POST   | `/accounts/password`       | Reset password           |
| GET    | `/courses`                 | List courses (paginated) |

### Protected Endpoints

| Method | Endpoint                 | Description      |
| ------ | ------------------------ | ---------------- |
| GET    | `/accounts/:id`          | Get account      |
| PATCH  | `/accounts/:id`          | Update account   |
| POST   | `/courses`               | Create course    |
| PUT    | `/courses/:id`           | Update course    |
| DELETE | `/courses/:id`           | Delete course    |
| PATCH  | `/courses/:id/publish`   | Publish course   |
| PATCH  | `/courses/:id/unpublish` | Unpublish course |
| PATCH  | `/courses/:id/hide`      | Hide course      |
| PATCH  | `/courses/:id/price`     | Update price     |
| POST   | `/courses/:id/rating`    | Rate course      |
| PUT    | `/ratings/:id`           | Edit rating      |

## Example Requests

### Register

```bash
curl -X POST http://localhost:3333/api/v1/accounts \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"123456"}'
```

### Login

```bash
curl -X POST http://localhost:3333/api/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"123456"}'
```

### Create Course

```bash
curl -X POST http://localhost:3333/api/v1/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"My Course","description":"Description"}'
```

## Authentication Header

```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

## Domain Entities

| Entity               | Description                 |
| -------------------- | --------------------------- |
| `Account`            | User account with auth info |
| `Course`             | Educational course          |
| `Rating`             | Course rating/review        |
| `RefreshToken`       | JWT refresh token           |
| `PasswordResetToken` | Password reset token        |
| `CourseMetrics`      | Course analytics            |

## Value Objects

| Value Object     | Properties       |
| ---------------- | ---------------- |
| `Price`          | amount, currency |
| `Stars`          | value (0.5-5)    |
| `UniqueEntityId` | UUID wrapper     |

## Error Classes

| Class                       | HTTP Status | Use Case              |
| --------------------------- | ----------- | --------------------- |
| `WrongCredentialsError`     | 400         | Invalid login         |
| `ResourceNotFoundError`     | 404         | Entity not found      |
| `NotAllowedError`           | 403         | Unauthorized action   |
| `InvalidTokenError`         | 401         | Invalid/expired token |
| `AccountAlreadyExistsError` | 409         | Duplicate email       |

## Environment Variables

| Variable          | Required | Description                  |
| ----------------- | -------- | ---------------------------- |
| `PORT`            | No       | Server port (default: 3333)  |
| `DATABASE_URL`    | Yes      | PostgreSQL connection string |
| `JWT_PRIVATE_KEY` | Yes      | RSA private key (base64)     |
| `JWT_PUBLIC_KEY`  | Yes      | RSA public key (base64)      |
| `SMTP_*`          | No       | Email configuration          |

## Database Models

- `Account` - Users
- `Course` - Courses
- `Rating` - Reviews
- `CourseMetrics` - Analytics
- `RefreshToken` - Auth tokens
- `PasswordResetToken` - Reset tokens

## Architecture Layers

```
src/
├── core/           # Base classes, utilities
├── domain/
│   └── youcourse/
│       ├── application/   # Use cases, interfaces
│       └── enterprise/    # Entities, value objects
└── infra/
    ├── auth/       # JWT, guards
    ├── database/   # Prisma, repositories
    ├── http/       # Controllers, pipes
    └── services/   # External services (email)
```

## Use Cases

### Auth

- `RegisterAccountUseCase`
- `AuthenticateAccountUseCase`
- `RefreshTokenUseCase`

### Account

- `GetAccountByIdUseCase`
- `EditAccountDetailsUseCase`
- `EditPasswordUseCase`
- `RequestPasswordResetUseCase`

### Course

- `CreateCourseUseCase`
- `EditCourseDetailsUseCase`
- `DeleteCourseUseCase`
- `FetchCoursesUseCase`
- `PublishCourseUseCase`
- `UnpublishCourseUseCase`
- `HideCourseUseCase`
- `UpdateCoursePriceUseCase`

### Rating

- `RateCourseUseCase`
- `EditRatingUseCase`

## Design Patterns

- Clean Architecture
- Repository Pattern
- Use Case Pattern
- Either Pattern (error handling)
- Value Objects
- Presenter Pattern
- Dependency Injection

## Rate Limits

- Password endpoints: 5 requests/15 minutes

## Token Lifetimes

- Access token: 20 minutes
- Refresh token: 7 days

## Pagination

Default page size: 20 items  
Order options: `recent`, `popular`, `bestSelling`

```bash
GET /courses?page=1&orderBy=recent
```

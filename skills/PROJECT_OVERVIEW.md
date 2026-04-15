# YouCourse API - Project Overview

YouCourse API is a backend service for an online course platform similar to Udemy or Coursera. It provides comprehensive REST APIs for managing users, courses, ratings, and authentication.

## Core Features

### User Management

- Account registration with email verification
- Secure authentication using JWT tokens
- Profile editing (name, email)
- Password management with reset functionality
- Account status tracking (ACTIVE, SUSPENDED, DISABLED)

### Course Management

- Full CRUD operations for courses
- Course publishing/unpublishing workflow
- Course visibility control (show/hide)
- Price management with multiple currency support
- Course metrics tracking (views, clicks, sales, score)
- Course ordering by recent, popular, or best-selling

### Rating System

- Course rating with 0.5-5 stars (0.5 increments)
- Optional commentary/review text
- Edit existing ratings
- Rating aggregation (average score calculation)

### Authentication & Security

- JWT-based authentication with RS256 algorithm
- Access tokens (short-lived, 20 minutes)
- Refresh tokens (long-lived, 7 days, stored in database)
- Rate limiting on password-related endpoints (5 requests/15 minutes)
- Password hashing with bcrypt

## Tech Stack

| Category          | Technology              |
| ----------------- | ----------------------- |
| Framework         | NestJS 11.x             |
| Language          | TypeScript 5.7          |
| Database          | PostgreSQL              |
| ORM               | Prisma 7.x              |
| Authentication    | Passport.js + JWT       |
| Validation        | Zod                     |
| API Documentation | Swagger/OpenAPI         |
| Testing           | Vitest                  |
| Containerization  | Docker + Docker Compose |
| Package Manager   | pnpm                    |

## Project Structure

```
youcourse-api/
├── src/
│   ├── core/                    # Shared utilities, base classes
│   ├── domain/youcourse/        # Business logic (Clean Architecture)
│   │   ├── application/        # Use cases, interfaces
│   │   └── enterprise/         # Domain entities, value objects
│   └── infra/                  # Infrastructure (DB, HTTP, Auth)
├── prisma/
│   └── schema.prisma           # Database schema
├── skills/                      # AI documentation files
└── test/                       # Test utilities
```

## Key Design Patterns

1. **Clean Architecture**: Domain, Application, and Infrastructure layers
2. **Use Case Pattern**: Business logic encapsulated in use case classes
3. **Repository Pattern**: Abstract data access interfaces
4. **Either Pattern**: Functional error handling (Left/Right)
5. **Value Objects**: Immutable objects (Price, Stars)
6. **Entity Pattern**: Base class with ID and props
7. **Presenter Pattern**: HTTP response formatting

## API Base URL

```
http://localhost:3333/api/v1
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# Start development server
pnpm start:dev

# Run tests
pnpm test
```

## Environment Variables

See [CONFIGURATION.md](./CONFIGURATION.md) for full environment setup.

## Swagger Documentation

API documentation is available at:

```
http://localhost:3333/api/docs
```

## Future Features (TODO)

- HTTPS enforcement
- Internationalization (i18n)
- Course search functionality
- Cart system
- Checkout/payment processing
- Order management
- Access/delivery system
- Subscription management
- Refund handling
- Notification system
- Admin panel

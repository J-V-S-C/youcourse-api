# YouCourse API - Development Guide

## Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 15+
- Docker (optional)

## Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd youcourse-api
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Generate JWT keys
mkdir -p keys
openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout -out keys/public.pem
base64 -w 0 keys/private.pem > keys/jwt_private_key
base64 -w 0 keys/public.pem > keys/jwt_public_key

# Update .env with keys
# JWT_PRIVATE_KEY=cat keys/jwt_private_key
# JWT_PUBLIC_KEY=cat keys/jwt_public_key
```

### 3. Database Setup

```bash
# Start PostgreSQL (Docker)
docker-compose up -d postgres

# Or use local PostgreSQL
# Create database
createdb -U postgres youcourse

# Run migrations
pnpm prisma migrate dev

# Generate Prisma client
pnpm prisma generate

# (Optional) Open Prisma Studio
pnpm prisma studio
```

### 4. Start Development Server

```bash
pnpm start:dev
```

Server starts at: `http://localhost:3333`  
API docs: `http://localhost:3333/api/docs`

## Common Tasks

### Generate New Migration

```bash
pnpm prisma migrate dev --name descriptive_name
```

### Reset Database

```bash
pnpm prisma migrate reset
```

### Add New Dependencies

```bash
# Production dependency
pnpm add <package>

# Development dependency
pnpm add -D <package>

# Type definitions
pnpm add -D @types/<package>
```

### Create New Entity

1. Create domain entity:

```typescript
// src/domain/youcourse/enterprise/entities/new-entity.ts
export interface NewEntityProps {
  // properties
}

export class NewEntity extends Entity<NewEntityProps> {
  // methods
}
```

2. Create value objects if needed:

```typescript
// src/domain/youcourse/enterprise/entities/value-objects/
```

3. Add repository interface:

```typescript
// src/domain/youcourse/application/repositories/
export interface INewEntityRepository {
  findById(id: string): Promise<NewEntity | null>;
  create(entity: NewEntity): Promise<void>;
  update(entity: NewEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
```

4. Create Prisma model:

```prisma
// prisma/schema.prisma
model NewEntity {
  id    String @id @default(uuid())
  // fields
}
```

5. Generate migration:

```bash
pnpm prisma migrate dev --name add_new_entity
pnpm prisma generate
```

6. Create repository implementation:

```typescript
// src/infra/database/prisma/repositories/
export class PrismaNewEntityRepository implements INewEntityRepository {
  // implementation
}
```

7. Create mapper:

```typescript
// src/infra/database/prisma/mappers/
export class PrismaNewEntityMapper {
  static toDomain(raw: NewEntityModel): NewEntity {}
  static toPrisma(entity: NewEntity): NewEntityModel {}
}
```

8. Create use case:

```typescript
// src/domain/youcourse/application/use-cases/new-entity/
export class CreateNewEntityUseCase {
  constructor(private repository: INewEntityRepository) {}

  async execute(data: CreateNewEntityInput): Promise<Either<Error, Success>> {
    // business logic
  }
}
```

9. Create controller:

```typescript
// src/infra/http/controllers/
@Controller('/new-entities')
export class CreateNewEntityController {
  constructor(private create: CreateNewEntityUseCase) {}

  @Post()
  async handle(@Body() body: CreateDto) {
    // HTTP handling
  }
}
```

### Create New Use Case

```typescript
// src/domain/youcourse/application/use-cases/example/create-example.ts
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from './errors/resource-not-found-error';

interface CreateExampleInput {
  name: string;
}

interface CreateExampleOutput {
  example: Example;
}

export class CreateExampleUseCase {
  constructor(private examplesRepository: IExamplesRepository) {}

  async execute(
    data: CreateExampleInput,
  ): Promise<Either<Error, CreateExampleOutput>> {
    // Business logic
    const example = Example.create(data);

    await this.examplesRepository.create(example);

    return right({ example });
  }
}
```

### Add Validation Schema

```typescript
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

type CreateSchema = z.infer<typeof createSchema>;
```

## Code Style

### TypeScript Conventions

- Use explicit types over `any`
- Prefer interfaces over type aliases for objects
- Use `readonly` for immutable data
- Use `private` visibility modifiers

### Naming Conventions

| Type        | Convention                          | Example                      |
| ----------- | ----------------------------------- | ---------------------------- |
| Classes     | PascalCase                          | `CreateAccountUseCase`       |
| Interfaces  | PascalCase (with I prefix optional) | `IAccountsRepository`        |
| Variables   | camelCase                           | `userName`                   |
| Constants   | UPPER_SNAKE                         | `MAX_RETRIES`                |
| Files       | kebab-case                          | `create-account.e2e-spec.ts` |
| Directories | kebab-case                          | `use-cases/`                 |

### Import Organization

```typescript
// 1. External packages
import { NestFactory } from '@nestjs/core';
import { z } from 'zod';

// 2. Internal modules
import { AppModule } from './infra/app.module';

// 3. Domain
import { Account } from '@/domain/youcourse/enterprise/entities/account';
import { IAccountsRepository } from '@/domain/youcourse/application/repositories';

// 4. Core
import { Either, left, right } from '@/core/either';

// 5. Relative imports
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
```

## Debugging

### VS Code Debug Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug: Start",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["run", "start:dev"],
      "skipFiles": ["<node_internals>/**"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Useful Breakpoints

- Controllers: Request entry points
- Use Cases: Business logic
- Repositories: Database operations

## Troubleshooting

### Prisma Client Not Found

```bash
pnpm prisma generate
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Verify connection string in .env
```

### Port Already in Use

```bash
# Find process using port 3333
lsof -i :3333

# Kill the process or change PORT in .env
```

### Migration Failed

```bash
# Check migration status
pnpm prisma migrate status

# Reset if needed (dev only)
pnpm prisma migrate reset
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev)
- [Vitest Documentation](https://vitest.dev)

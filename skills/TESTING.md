# YouCourse API - Testing Guide

## Overview

YouCourse API uses Vitest for testing with support for both unit and end-to-end tests.

## Test Structure

```
youcourse-api/
├── src/
│   └── ... (source code)
├── test/
│   ├── setup.ts                 # Test configuration
│   └── vitest.config.e2e.ts    # E2E test config
└── **/*.spec.ts               # Unit tests
    **/*.e2e-spec.ts           # E2E tests
```

## Running Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run E2E tests
pnpm test:e2e

# Run specific test file
pnpm test -- auth.service.spec.ts
```

## Unit Tests

### Structure

```typescript
// auth.service.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthenticateAccountUseCase } from './authenticate-account';
import { InMemoryAccountsRepository } from '@/test/in-memory-accounts-repository';

describe('AuthenticateAccountUseCase', () => {
  let useCase: AuthenticateAccountUseCase;
  let accountsRepository: InMemoryAccountsRepository;
  let hasher: InMemoryHasher;
  let encrypter: InMemoryEncrypter;

  beforeEach(() => {
    // Setup dependencies
    accountsRepository = new InMemoryAccountsRepository();
    hasher = new InMemoryHasher();
    encrypter = new InMemoryEncrypter();
    useCase = new AuthenticateAccountUseCase(
      accountsRepository,
      hasher,
      encrypter,
    );
  });

  it('should authenticate account with valid credentials', async () => {
    // Arrange
    await accountsRepository.create({
      email: 'test@example.com',
      password: 'hashed-password',
    });
    hasher.compare.mockResolvedValue(true);
    encrypter.encrypt.mockResolvedValue('token');

    // Act
    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'password123',
    });

    // Assert
    expect(result.isRight()).toBe(true);
    expect(result.value).toHaveProperty('accessToken');
    expect(result.value).toHaveProperty('refreshToken');
  });

  it('should return error for invalid credentials', async () => {
    // Act
    const result = await useCase.execute({
      email: 'wrong@example.com',
      password: 'wrong-password',
    });

    // Assert
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(WrongCredentialsError);
  });
});
```

### In-Memory Repositories

For unit tests, in-memory implementations are used:

```typescript
// test/in-memory-accounts-repository.ts
export class InMemoryAccountsRepository implements IAccountsRepository {
  private accounts: Account[] = [];

  async findByEmail(email: string): Promise<Account | null> {
    return this.accounts.find((a) => a.email === email) ?? null;
  }

  async findById(id: string): Promise<Account | null> {
    return this.accounts.find((a) => a.id.toString() === id) ?? null;
  }

  async create(account: Account): Promise<void> {
    this.accounts.push(account);
  }

  async update(account: Account): Promise<void> {
    const index = this.accounts.findIndex((a) => a.id === account.id);
    if (index !== -1) {
      this.accounts[index] = account;
    }
  }
}
```

## End-to-End Tests

### E2E Test Structure

```typescript
// create-account.controller.e2e-spec.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { App } from '../app';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('AccountsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [App],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/accounts (POST)', () => {
    it('should create a new account', async () => {
      const response = await request(app.getHttpServer())
        .post('/accounts')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('account');
      expect(response.body.account.email).toBe('john@example.com');
    });

    it('should return 409 for duplicate email', async () => {
      // First create
      await request(app.getHttpServer()).post('/accounts').send({
        name: 'John Doe',
        email: 'duplicate@example.com',
        password: 'password123',
      });

      // Second create with same email
      await request(app.getHttpServer())
        .post('/accounts')
        .send({
          name: 'Jane Doe',
          email: 'duplicate@example.com',
          password: 'password456',
        })
        .expect(409);
    });

    it('should return 400 for invalid email', async () => {
      await request(app.getHttpServer())
        .post('/accounts')
        .send({
          name: 'John Doe',
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });
  });
});
```

### E2E Test Configuration

```typescript
// vitest.config.e2e.ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    include: ['test/**/*.e2e-spec.ts'],
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
```

## Test Utilities

### Faker Helpers

```typescript
// test/factories.ts
import { faker } from '@faker-js/faker';
import {
  Account,
  AccountProps,
} from '@/domain/youcourse/enterprise/entities/account';

export function makeAccount(override?: Partial<AccountProps>) {
  return Account.create({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    status: 'ACTIVE',
    createdAt: new Date(),
    ...override,
  });
}

export function makeCourse(override?: Partial<CourseProps>) {
  return Course.create({
    creatorId: faker.string.uuid(),
    name: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    visible: true,
    sellable: true,
    createdAt: new Date(),
    ...override,
  });
}
```

## Test Coverage

Coverage report is generated in `coverage/` directory:

```
coverage/
├── lcov-report/    # HTML report
├── lcov.info      # Coverage data
└── clover.xml     # Clover format
```

## Best Practices

1. **Test Naming**
   - Use descriptive names: `should_return_error_when_email_not_found`
   - Group related tests with `describe` blocks

2. **Arrange-Act-Assert**

   ```typescript
   it('should authenticate user', async () => {
     // Arrange
     const credentials = { email: 'test@test.com', password: 'pass' };

     // Act
     const result = await useCase.execute(credentials);

     // Assert
     expect(result.isRight()).toBe(true);
   });
   ```

3. **Isolation**
   - Each test should be independent
   - Use fresh instances for each test (beforeEach)

4. **Edge Cases**
   - Test invalid inputs
   - Test boundary conditions
   - Test error scenarios

5. **Mocking**
   - Mock external services (email, cache)
   - Use real implementations for business logic

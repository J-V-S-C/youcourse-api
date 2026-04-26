# YouCourse API - Configuration

## Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Server Configuration
PORT=3333

# Database Configuration
DATABASE_URL=postgresql://youcourse:password@localhost:5432/youcourse
DB_PORT=5432

# JWT Configuration (RS256)
JWT_PRIVATE_KEY=your_base64_encoded_rsa_private_key
JWT_PUBLIC_KEY=your_base64_encoded_rsa_public_key

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application URL (for email links)
APP_URL=http://localhost:3333
```

## Variable Details

### Server Configuration

| Variable | Default | Description      |
| -------- | ------- | ---------------- |
| `PORT`   | 3333    | HTTP server port |

### Database Configuration

| Variable       | Default | Description                  |
| -------------- | ------- | ---------------------------- |
| `DATABASE_URL` | -       | PostgreSQL connection string |
| `DB_PORT`      | 5432    | PostgreSQL port              |

**Connection String Format:**

```
postgresql://username:password@host:port/database
```

### JWT Configuration

| Variable          | Required | Description                    |
| ----------------- | -------- | ------------------------------ |
| `JWT_PRIVATE_KEY` | Yes      | Base64-encoded RSA private key |
| `JWT_PUBLIC_KEY`  | Yes      | Base64-encoded RSA public key  |

**Generate Keys:**

```bash
# Create keys directory
mkdir -p keys

# Generate RSA key pair (2048-bit)
openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout -out keys/public.pem

# Convert to base64
base64 -w 0 keys/private.pem > keys/jwt_private_key
base64 -w 0 keys/public.pem > keys/jwt_public_key
```

### Email Configuration (SMTP)

| Variable    | Required | Description          |
| ----------- | -------- | -------------------- |
| `SMTP_HOST` | No       | SMTP server hostname |
| `SMTP_PORT` | No       | SMTP server port     |
| `SMTP_USER` | No       | SMTP username        |
| `SMTP_PASS` | No       | SMTP password        |

**Common SMTP Settings:**
| Provider | Host | Port | Security |
|----------|------|------|----------|
| Gmail | smtp.gmail.com | 465 | SSL |
| Gmail | smtp.gmail.com | 587 | TLS |
| SendGrid | smtp.sendgrid.net | 587 | TLS |
| Mailgun | smtp.mailgun.org | 587 | TLS |

**Gmail App Password:**

1. Enable 2-Factor Authentication
2. Go to App Passwords
3. Generate new app password for "Mail"
4. Use the generated password (16 characters)

### Application Configuration

| Variable  | Default               | Description          |
| --------- | --------------------- | -------------------- |
| `APP_URL` | http://localhost:3333 | Application base URL |

## Validation Schema

Environment variables are validated on startup using Zod:

```typescript
// src/infra/env/env.ts
import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url(),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASS: z.string().optional(),
  APP_URL: z.string().url().default('http://localhost:3333'),
});
```

## Docker Configuration

### Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build
RUN pnpm build

# Production
FROM node:20-alpine
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/package.json ./package.json

EXPOSE 3333
CMD ["node", "dist/src/main"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: youcourse
      POSTGRES_USER: youcourse
      POSTGRES_PASSWORD: password
    ports:
      - 5432:5432
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - 3333:3333
    environment:
      DATABASE_URL: postgresql://youcourse:password@postgres:5432/youcourse
      JWT_PRIVATE_KEY: ${JWT_PRIVATE_KEY}
      JWT_PUBLIC_KEY: ${JWT_PUBLIC_KEY}
    depends_on:
      - postgres

volumes:
  postgres_data:
```

## Environment-Specific Configurations

### Development (.env.local)

```bash
PORT=3333
DATABASE_URL=postgresql://youcourse:dev_password@localhost:5432/youcourse_dev
JWT_PRIVATE_KEY=<dev-private-key-base64>
JWT_PUBLIC_KEY=<dev-public-key-base64>
SMTP_HOST=localhost
SMTP_PORT=1025
```

### Production (.env.production)

```bash
PORT=3333
DATABASE_URL=<production-database-url>
JWT_PRIVATE_KEY=<production-private-key>
JWT_PUBLIC_KEY=<production-public-key>
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<sendgrid-api-key>
```

## TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## NestJS CLI Configuration

```json
// nest-cli.json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

## Package Scripts

| Script                 | Description                              |
| ---------------------- | ---------------------------------------- |
| `pnpm start`           | Start production server                  |
| `pnpm start:dev`       | Start development server with hot reload |
| `pnpm build`           | Build for production                     |
| `pnpm test`            | Run unit tests                           |
| `pnpm test:e2e`        | Run end-to-end tests                     |
| `pnpm lint`            | Run linter                               |
| `pnpm prisma:generate` | Generate Prisma client                   |
| `pnpm prisma:migrate`  | Run database migrations                  |
| `pnpm prisma:studio`   | Open Prisma Studio                       |

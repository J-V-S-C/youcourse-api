# YouCourse API - Authentication & Authorization

## Overview

YouCourse API uses JWT-based authentication with RS256 algorithm and refresh token rotation strategy.

## Authentication Flow

```
┌─────────┐                    ┌─────────────┐                    ┌─────────┐
│  Client │                    │  YouCourse  │                    │   DB    │
└────┬────┘                    └──────┬──────┘                    └────┬────┘
     │                                 │                               │
     │  POST /sessions                 │                               │
     │  {email, password}              │                               │
     │────────────────────────────────►│                               │
     │                                 │                               │
     │                                 │  Find account by email        │
     │                                 │───────────────────────────────►│
     │                                 │                               │
     │                                 │  Compare password (bcrypt)    │
     │                                 │◄───────────────────────────────│
     │                                 │                               │
     │                                 │  Generate access + refresh    │
     │                                 │      tokens (RS256)           │
     │                                 │                               │
     │                                 │  Store refresh token          │
     │                                 │───────────────────────────────►│
     │                                 │                               │
     │  {access_token, refresh_token} │                               │
     │◄────────────────────────────────│                               │
     │                                 │                               │
```

## Token Types

### Access Token

**Purpose:** Authentication for API requests  
**Lifetime:** 20 minutes  
**Algorithm:** RS256 (RSA with SHA-256)

**Payload:**

```json
{
  "sub": "uuid-of-user",
  "iat": 1234567890,
  "exp": 1234568890
}
```

**Usage:**

```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

### Refresh Token

**Purpose:** Obtain new access tokens  
**Lifetime:** 7 days  
**Storage:** Database (not JWT payload)

**Payload:**

```json
{
  "token": "unique-token-string",
  "accountId": "uuid",
  "expiresAt": "2024-01-08T00:00:00.000Z"
}
```

**Usage:**

```http
POST /sessions/refresh
{
  "refreshToken": "unique-token-string"
}
```

## Token Generation

### RS256 Algorithm

Uses asymmetric key pairs:

```typescript
// Private key for signing (server-side only)
JWT_PRIVATE_KEY = base64 - encoded - rsa - private - key;

// Public key for verification
JWT_PUBLIC_KEY = base64 - encoded - rsa - public - key;
```

**Key Generation:**

```bash
# Generate RSA key pair
openssl genrsa -out private.pem 2048

# Extract public key
openssl rsa -in private.pem -pubout -out public.pem

# Convert to base64
base64 -w 0 private.pem > jwt_private_key
base64 -w 0 public.pem > jwt_public_key
```

## Implementation Details

### JWT Strategy

```typescript
// src/infra/auth/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_PUBLIC_KEY,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: UserPayload) {
    return { sub: payload.sub };
  }
}

export interface UserPayload {
  sub: string; // Account ID
  iat: number; // Issued at
  exp: number; // Expiration
}
```

### JWT Encrypter

```typescript
// src/infra/cryptography/jwt-encrypter.ts
export class JwtEncrypter implements IEncrypterService {
  async encrypt(payload: Record<string, unknown>): Promise<string> {
    return this.jwtService.sign(payload, {
      privateKey: Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64'),
      algorithm: 'RS256',
    });
  }

  async decrypt(token: string): Promise<Record<string, unknown>> {
    return this.jwtService.verify(token, {
      publicKey: Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64'),
      algorithms: ['RS256'],
    });
  }
}
```

## Guards & Decorators

### JwtAuthGuard

Global guard that protects all routes by default:

```typescript
// src/main.ts
app.useGlobalGuards(new JwtAuthGuard(new Reflector()));
```

### Public Decorator

Mark routes as publicly accessible:

```typescript
// src/infra/auth/public.ts
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// Usage
@Public()
@Controller('/accounts')
export class AccountController {}
```

### CurrentUser Decorator

Extract current user from request:

```typescript
// src/infra/auth/current-user.decorator.ts
export const CurrentUser = () => User();

@Patch('/accounts/:id')
async handle(
  @CurrentUser() user: UserPayload,
  @Param('id') accountId: string,
) {
  console.log(user.sub); // Account UUID
}
```

## Authorization Rules

### Resource Ownership

Users can only modify their own resources:

```typescript
@Patch('/courses/:courseId')
async handle(
  @CurrentUser() user: UserPayload,
  @Param('courseId') courseId: string,
  @Body() body: EditCourseDto,
) {
  // Verify ownership
  const course = await this.courses.findById(courseId);

  if (course.creatorId !== user.sub) {
    throw new ForbiddenException();
  }

  // Proceed with update
}
```

### Account Access

| Endpoint            | Rule                     |
| ------------------- | ------------------------ |
| GET /accounts/:id   | Authenticated (any user) |
| PATCH /accounts/:id | Authenticated (any user) |
| POST /accounts      | Public                   |

### Course Access

| Endpoint                     | Rule          |
| ---------------------------- | ------------- |
| GET /courses                 | Public        |
| POST /courses                | Authenticated |
| PUT /courses/:id             | Owner only    |
| DELETE /courses/:id          | Owner only    |
| PATCH /courses/:id/publish   | Owner only    |
| PATCH /courses/:id/unpublish | Owner only    |
| PATCH /courses/:id/hide      | Owner only    |
| PATCH /courses/:id/price     | Owner only    |

### Rating Access

| Endpoint                 | Rule          |
| ------------------------ | ------------- |
| POST /courses/:id/rating | Authenticated |
| PUT /ratings/:id         | Owner only    |

## Password Security

### Hashing

Uses bcrypt with default salt rounds (10):

```typescript
// src/infra/cryptography/bcrypt-hasher.ts
export class BcryptHasher implements ICryptographyService {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
```

### Password Reset Flow

```
User requests reset
       ↓
Email sent with token (valid 15 min)
       ↓
User submits token + new password
       ↓
Token validated and deleted
       ↓
Password updated
       ↓
All refresh tokens invalidated
```

## Rate Limiting

Password-related endpoints are rate-limited:

```typescript
@UseGuards(ThrottlerGuard)
@Controller('/accounts/password')
export class PasswordController {}

// Configuration: 5 requests per 15 minutes
```

## Security Headers

Recommended response headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

## Error Responses

| Status | Error        | When                  |
| ------ | ------------ | --------------------- |
| 401    | Unauthorized | Missing token         |
| 401    | Unauthorized | Invalid/expired token |
| 403    | Forbidden    | Not resource owner    |

## Best Practices

1. **Token Storage**
   - Access tokens: Memory (not localStorage)
   - Refresh tokens: HttpOnly cookies or secure storage

2. **Token Rotation**
   - Each refresh generates new access + refresh token
   - Old refresh token is invalidated

3. **Session Invalidation**
   - Password change invalidates all refresh tokens
   - Logout deletes current refresh token

4. **Key Management**
   - Rotate keys periodically
   - Store keys securely (env vars, secrets manager)
   - Never commit keys to version control

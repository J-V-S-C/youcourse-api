# YouCourse API - Architecture

## Overview

YouCourse API follows **Clean Architecture** principles, separating concerns into distinct layers:

```
┌─────────────────────────────────────────┐
│            Infrastructure               │
│  (HTTP, Database, Auth, External APIs)  │
├─────────────────────────────────────────┤
│            Application                  │
│     (Use Cases, Services, Interfaces)   │
├─────────────────────────────────────────┤
│              Domain                     │
│      (Entities, Value Objects)          │
├─────────────────────────────────────────┤
│               Core                      │
│    (Base Classes, Utilities, Types)     │
└─────────────────────────────────────────┘
```

## Layer Details

### Core Layer (`src/core/`)

Base classes and shared utilities used throughout the application.

**Entities (`src/core/entities/`)**

```typescript
// Base entity with ID
class Entity<Props> {
  protected readonly props: Props;
  protected readonly id: UniqueEntityId;

  equals(entity: Entity<any>): boolean;
}

// UUID wrapper for entity IDs
class UniqueEntityId {
  private readonly value: string;
  toString(): string;
}

// Value object base class
class ValueObject<Props> {
  protected readonly props: Props;
  equals(vo: ValueObject<any>): boolean;
}
```

**Utilities (`src/core/`)**

```typescript
// Either type for functional error handling
type Either<Left, Right>;
left<L>(value: L): Either<L, never>;
right<R>(value: R): Either<never, R>;

// Optional type helper
type Optional<T, K extends keyof T>;

// Pagination parameters
interface PaginationParams {
  page: number;
  perPage: number;
}
```

---

### Domain Layer (`src/domain/youcourse/`)

Business logic and rules. This layer has no external dependencies.

#### Enterprise Entities (`src/domain/youcourse/enterprise/entities/`)

**Account Entity**

```typescript
interface AccountProps {
  name: string;
  email: string;
  password: string;
  status: AccountStatus;
  createdAt: Date;
  lastLogin?: Date;
}

type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DISABLED';

class Account extends Entity<AccountProps> {
  get name(): string;
  get email(): string;
  get status(): AccountStatus;

  updateName(name: string): void;
  updateEmail(email: string): void;
  updateLastLogin(): void;
}
```

**Course Entity**

```typescript
interface CourseProps {
  creatorId: UniqueEntityID;
  name: string;
  description: string;
  price?: Price;
  visible: boolean;
  sellable: boolean;
  units: Unit[];
  createdAt: Date;
  updatedAt?: Date;
}

class Course extends Entity<CourseProps> {
  get name(): string;
  get description(): string;
  get price(): Price | undefined;
  get visible(): boolean;
  get sellable(): boolean;
  get creatorId(): UniqueEntityID;
  get units(): Unit[];

  publish(price: Price): void;
  unpublish(): void;
  hide(): void;
  updatePrice(price: Price): void;
}
```

**Unit Entity**

```typescript
interface UnitProps {
  courseId: UniqueEntityID;
  name: string;
  description?: string;
  position: number;
  createdAt: Date;
  updatedAt?: Date;
}

class Unit extends Entity<UnitProps> {
  get courseId(): UniqueEntityID;
  get name(): string;
  get description(): string | undefined;
  get position(): number;
  get createdAt(): Date;
  get updatedAt(): Date | undefined;

  updateDetails(name: string, description?: string): void;
  reorder(position: number): void;
}
```

**Lesson Entity**

```typescript
interface LessonProps {
  unitId: UniqueEntityID;
  name: string;
  description?: string;
  video: Video | null;
  position: number;
  isPreview: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

class Lesson extends Entity<LessonProps> {
  get unitId(): UniqueEntityID;
  get name(): string;
  get description(): string | undefined;
  get video(): Video | null;
  get position(): number;
  get isPreview(): boolean;
  get hasVideo(): boolean;
  get isVideoReady(): boolean;
  get isVideoProcessing(): boolean;
  get isVideoFailed(): boolean;

  updateDetails(name: string, description?: string): void;
  reorder(position: number): void;
  setPreview(isPreview: boolean): void;
  attachVideo(video: Video): void;
  removeVideo(): void;
}
```

**Video Value Object**

```typescript
enum VideoStatus {
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
}

class Video extends ValueObject<VideoValueObjectProps> {
  get externalId(): string;
  get playbackUrl(): string;
  get thumbnailUrl(): string | undefined;
  get status(): VideoStatus;
  get duration(): number | undefined;
  get originalFilename(): string | undefined;
  get isReady(): boolean;
  get isProcessing(): boolean;
  get isFailed(): boolean;
  get formattedDuration(): string | null;

  markAsProcessing(): void;
  markAsReady(
    playbackUrl: string,
    thumbnailUrl?: string,
    duration?: number,
  ): void;
  markAsFailed(): void;

  static createUploading(props: {
    externalId: string;
    playbackUrl: string;
  }): Video;
  static createReady(props: CreateVideoProps): Video;
  toJSON(): VideoJSON;
}
```

**Rating Entity**

```typescript
interface RatingProps {
  creatorId: string;
  courseId: string;
  stars: Stars;
  commentary: string;
  createdAt: Date;
  updatedAt?: Date;
}

class Rating extends Entity<RatingProps> {
  get stars(): Stars;
  get commentary(): string;

  updateStars(stars: Stars): void;
  updateCommentary(commentary: string): void;
}
```

**Refresh Token Entity**

```typescript
interface RefreshTokenProps {
  token: string;
  accountId: string;
  expiresAt: Date;
}

class RefreshToken extends Entity<RefreshTokenProps> {
  isExpired(): boolean;
  isValid(): boolean;
}
```

**Password Reset Token Entity**

```typescript
interface PasswordResetTokenProps {
  token: string;
  accountId: string;
  expiresAt: Date;
  usedAt?: Date;
}

class PasswordResetToken extends Entity<PasswordResetTokenProps> {
  isExpired(): boolean;
  isUsed(): boolean;
  markAsUsed(): void;
}
```

#### Value Objects (`src/domain/youcourse/enterprise/entities/value-objects/`)

**Price Value Object**

```typescript
interface PriceProps {
  amount: number; // em centavos
  currency: string; // e.g., 'BRL'
}

class Price extends ValueObject<PriceProps> {
  get amount(): number;
  get currency(): string;

  static create(props: PriceProps): Price;
  toJSON(): PriceProps;
}
```

**Stars Value Object**

```typescript
interface StarsProps {
  value: number; // 0.5 to 5, step 0.5
}

class Stars extends ValueObject<StarsProps> {
  get value(): number;

  static create(value: number): Stars;
  equals(other: Stars): boolean;
}
```

---

### Application Layer (`src/domain/youcourse/application/`)

Use cases and business rules orchestration.

#### Use Cases

**Authentication Use Cases**

| Use Case                     | Description                           |
| ---------------------------- | ------------------------------------- |
| `RegisterAccountUseCase`     | Create new user account               |
| `AuthenticateAccountUseCase` | Validate credentials, return tokens   |
| `RefreshTokenUseCase`        | Exchange refresh token for new tokens |

**Account Use Cases**

| Use Case                      | Description                      |
| ----------------------------- | -------------------------------- |
| `GetAccountByIdUseCase`       | Retrieve account by ID           |
| `EditAccountDetailsUseCase`   | Update account name/email        |
| `EditPasswordUseCase`         | Change password with reset token |
| `RequestPasswordResetUseCase` | Generate password reset token    |

**Course Use Cases**

| Use Case                   | Description                    |
| -------------------------- | ------------------------------ |
| `CreateCourseUseCase`      | Create new course              |
| `EditCourseDetailsUseCase` | Update course name/description |
| `DeleteCourseUseCase`      | Remove course                  |
| `FetchCoursesUseCase`      | List courses with pagination   |
| `PublishCourseUseCase`     | Publish course with price      |
| `UnpublishCourseUseCase`   | Unpublish course               |
| `HideCourseUseCase`        | Hide course from public view   |
| `UpdateCoursePriceUseCase` | Change course price            |

**Rating Use Cases**

| Use Case            | Description            |
| ------------------- | ---------------------- |
| `RateCourseUseCase` | Add rating to course   |
| `EditRatingUseCase` | Update existing rating |

**Unit Use Cases**

| Use Case                 | Description                  |
| ------------------------ | ---------------------------- |
| `CreateUnitUseCase`      | Create new unit in a course  |
| `EditUnitDetailsUseCase` | Update unit name/description |
| `DeleteUnitUseCase`      | Remove unit from course      |
| `FetchUnitsUseCase`      | List units for a course      |

**Lesson Use Cases**

| Use Case                     | Description                    |
| ---------------------------- | ------------------------------ |
| `CreateLessonUseCase`        | Create new lesson in a unit    |
| `EditLessonDetailsUseCase`   | Update lesson name/description |
| `DeleteLessonUseCase`        | Remove lesson from unit        |
| `AttachVideoToLessonUseCase` | Attach video to lesson         |

#### Repository Interfaces

```typescript
interface IAccountsRepository {
  findById(id: string): Promise<Account | null>;
  findByEmail(email: string): Promise<Account | null>;
  create(account: Account): Promise<void>;
  update(account: Account): Promise<void>;
}

interface ICoursesRepository {
  findById(id: string): Promise<Course | null>;
  findMany(params: FetchCoursesParams): Promise<Course[]>;
  create(course: Course): Promise<void>;
  update(course: Course): Promise<void>;
  delete(id: string): Promise<void>;
}

interface IRatingsRepository {
  findById(id: string): Promise<Rating | null>;
  findByCourseId(courseId: string): Promise<Rating[]>;
  findByCreatorAndCourse(
    creatorId: string,
    courseId: string,
  ): Promise<Rating | null>;
  create(rating: Rating): Promise<void>;
  update(rating: Rating): Promise<void>;
}

interface IRefreshTokensRepository {
  findByToken(token: string): Promise<RefreshToken | null>;
  create(token: RefreshToken): Promise<void>;
  deleteByAccountId(accountId: string): Promise<void>;
}

interface IPasswordResetTokensRepository {
  findByToken(token: string): Promise<PasswordResetToken | null>;
  create(token: PasswordResetToken): Promise<void>;
  update(token: PasswordResetToken): Promise<void>;
}

interface IUnitsRepository {
  create(unit: Unit): Promise<void>;
  save(unit: Unit): Promise<void>;
  findById(id: string): Promise<Unit | null>;
  findByCourseId(courseId: string): Promise<Unit[]>;
  findByIdWithLessons(id: string): Promise<Unit | null>;
  delete(unit: Unit): Promise<void>;
}

interface ILessonsRepository {
  create(lesson: Lesson): Promise<void>;
  save(lesson: Lesson): Promise<void>;
  findById(id: string): Promise<Lesson | null>;
  findManyByUnitId(params: {
    unitId: UniqueEntityID;
    params: PaginationParams;
  }): Promise<Lesson[]>;
  delete(lesson: Lesson): Promise<void>;
}
```

#### Service Interfaces

```typescript
interface ICryptographyService {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

interface IEncrypterService {
  encrypt(payload: Record<string, unknown>): Promise<string>;
  decrypt(token: string): Promise<Record<string, unknown>>;
}

interface ITokenGeneratorService {
  generate(): string;
}

interface IEmailService {
  sendPasswordReset(email: string, token: string): Promise<void>;
}

interface IVideoService {
  initiateUpload(
    filename: string,
    contentType: string,
  ): Promise<UploadVideoResult>;
  getVideoStatus(externalId: string): Promise<Video>;
  getSignedPlaybackUrl(
    externalId: string,
    expiresInSeconds?: number,
  ): Promise<string>;
  deleteVideo(externalId: string): Promise<void>;
  generateThumbnail(externalId: string): Promise<string | null>;
}

interface UploadVideoResult {
  externalId: string;
  uploadUrl: string;
  status: 'uploading' | 'processing';
}
```

---

### Infrastructure Layer (`src/infra/`)

External implementations and framework-specific code.

#### HTTP Layer (`src/infra/http/`)

**Controllers** - Handle HTTP requests/responses

```typescript
@Controller('/accounts')
export class CreateAccountController {
  constructor(private registerAccount: RegisterAccountUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(@Body() body: CreateAccountBodySchema) {
    const result = await this.registerAccount.execute(body);

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return { account: AccountPresenter.toHTTP(result.value.account) };
  }
}
```

**Validation Pipe** - Zod-based request validation

```typescript
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodSchema) {}

  transform(value: unknown) {
    return this.schema.parse(value);
  }
}
```

**Presenters** - Transform domain objects to HTTP responses

```typescript
export class AccountPresenter {
  static toHTTP(account: Account) {
    return {
      id: account.id.toString(),
      name: account.name,
      email: account.email,
      createdAt: account.createdAt,
      lastLogin: account.lastLogin,
    };
  }
}
```

#### Authentication (`src/infra/auth/`)

**JWT Strategy**

```typescript
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
```

**Guards**

```typescript
export class JwtAuthGuard extends AuthGuard('jwt') {}

// Usage: @UseGuards(JwtAuthGuard)
```

**Decorators**

```typescript
@Public()           // Skip authentication
@CurrentUser()      // Get current user from request
```

#### Database (`src/infra/database/`)

**Prisma Service**

```typescript
@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      log: ['query', 'error', 'warn'],
    });
  }
}
```

**Mappers** - Convert between Prisma models and Domain entities

```typescript
export class PrismaAccountMapper {
  static toDomain(raw: AccountModel): Account {
    return Account.create(
      {
        name: raw.name,
        email: raw.email,
        password: raw.password,
        status: raw.status,
        createdAt: raw.createdAt,
        lastLogin: raw.lastLogin,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toPrisma(account: Account): AccountModel {
    return {
      id: account.id.toString(),
      name: account.name,
      email: account.email,
      password: account.password,
      status: account.status,
      createdAt: account.createdAt,
      lastLogin: account.lastLogin,
    };
  }
}
```

#### Cryptography (`src/infra/cryptography/`)

**Implementations:**

- `BcryptHasher` - Password hashing (bcryptjs)
- `JwtEncrypter` - JWT signing/verification (RS256)
- `UuidTokenGenerator` - UUID token generation

---

## Dependency Injection

NestJS handles dependency injection through decorators:

```typescript
@Module({
  imports: [DatabaseModule, CryptographyModule, ServicesModule],
  controllers: [AccountsController, CoursesController],
  providers: [
    {
      provide: IAccountsRepository,
      useClass: PrismaAccountsRepository,
    },
  ],
})
export class HttpModule {}
```

---

## Error Handling

### Application Errors

```typescript
export class WrongCredentialsError extends Error {}
export class ResourceNotFoundError extends Error {}
export class NotAllowedError extends Error {}
export class InvalidTokenError extends Error {}
export class AccountAlreadyExistsError extends Error {}
```

### Error Flow

```
HTTP Request
    ↓
Controller
    ↓
Use Case (returns Either<Error, Success>)
    ↓
Error? → Throw HTTP Exception (BadRequest, NotFound, etc.)
Success? → Transform with Presenter → Return Response
```

---

## Request/Response Flow

```
Client Request
      ↓
┌─────────────────┐
│   JWT Guard     │ ← Validates token
└────────┬────────┘
         ↓
┌─────────────────┐
│ Zod Validation  │ ← Validates body/params/query
└────────┬────────┘
         ↓
┌─────────────────┐
│   Controller    │ ← Extracts data
└────────┬────────┘
         ↓
┌─────────────────┐
│   Use Case      │ ← Business logic
└────────┬────────┘
         ↓
┌─────────────────┐
│  Repository     │ ← Database access
└────────┬────────┘
         ↓
┌─────────────────┐
│   Presenter     │ ← Transform response
└────────┬────────┘
         ↓
    HTTP Response
```

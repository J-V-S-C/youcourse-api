import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AccountsRepository } from 'src/domain/youcourse/application/repositories/accounts-repository';
import { PrismaAccountsRepository } from './prisma/repositories/prisma-accounts-repository';
import { CoursesRepository } from 'src/domain/youcourse/application/repositories/courses-repository';
import { PrismaCoursesRepository } from './prisma/repositories/prisma-courses-repository';
import { EnvModule } from '../env/env.module';
import { RatingsRepository } from 'src/domain/youcourse/application/repositories/ratings-repository';
import { PrismaRatingsRepository } from './prisma/repositories/prisma-ratings-repository';
import { PasswordResetTokensRepository } from 'src/domain/youcourse/application/repositories/password-reset-tokens-repository';
import { PrismaPasswordResetTokensRepository } from './prisma/repositories/prisma-password-reset-tokens-repository';
import { RefreshTokensRepository } from 'src/domain/youcourse/application/repositories/refresh-tokens-repository';
import { PrismaRefreshTokensRepository } from './prisma/repositories/prisma-refresh-tokens-repository';

@Module({
  imports: [EnvModule],
  providers: [
    PrismaService,
    PrismaService,
    {
      provide: AccountsRepository,
      useClass: PrismaAccountsRepository,
    },
    {
      provide: CoursesRepository,
      useClass: PrismaCoursesRepository,
    },
    {
      provide: RatingsRepository,
      useClass: PrismaRatingsRepository,
    },
    {
      provide: PasswordResetTokensRepository,
      useClass: PrismaPasswordResetTokensRepository,
    },
    {
      provide: RefreshTokensRepository,
      useClass: PrismaRefreshTokensRepository,
    },
  ],
  exports: [
    PrismaService,
    AccountsRepository,
    CoursesRepository,
    RatingsRepository,
    PasswordResetTokensRepository,
    RefreshTokensRepository,
  ],
})
export class DatabaseModule {}

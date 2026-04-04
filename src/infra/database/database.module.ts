import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AccountsRepository } from 'src/domain/ecommerce/application/repositories/accounts-repository';
import { PrismaAccountsRepository } from './prisma/repositories/prisma-accounts-repository';
import { CoursesRepository } from 'src/domain/ecommerce/application/repositories/courses-repository';
import { PrismaCoursesRepository } from './prisma/repositories/prisma-courses-repository';
import { EnvService } from '../env/env.service';
import { RatingsRepository } from 'src/domain/ecommerce/application/repositories/ratings-repository';
import { PrismaRatingsRepository } from './prisma/repositories/prisma-ratings-repository';

@Module({
  providers: [
    EnvService,
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
  ],
  exports: [
    PrismaService,
    AccountsRepository,
    CoursesRepository,
    RatingsRepository,
  ],
})
export class DatabaseModule {}

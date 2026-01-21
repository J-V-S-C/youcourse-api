import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AccountsRepository } from 'src/domain/e-commerce/application/repositories/accounts-repository';
import { PrismaAccountsRepository } from './prisma/repositories/prisma-accounts-repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: AccountsRepository,
      useClass: PrismaAccountsRepository,
    },
  ],
  exports: [AccountsRepository],
})
export class DatabaseModule {}

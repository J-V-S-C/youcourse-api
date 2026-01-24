import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AccountsRepository } from 'src/domain/e-commerce/application/repositories/accounts-repository';
import { PrismaAccountsRepository } from './prisma/repositories/prisma-accounts-repository';
import { ProductsRepository } from 'src/domain/e-commerce/application/repositories/products-repository';
import { PrismaProductsRepository } from './prisma/repositories/prisma-products-repository';
import { EnvService } from '../env/env.service';

@Module({
  providers: [
    EnvService,
    PrismaService,
    {
      provide: AccountsRepository,
      useClass: PrismaAccountsRepository,
    },
    {
      provide: ProductsRepository,
      useClass: PrismaProductsRepository,
    },
  ],
  exports: [PrismaService, AccountsRepository, ProductsRepository],
})
export class DatabaseModule {}

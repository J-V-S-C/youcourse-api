// NOVO ARQUIVO: test/factories/prisma-account-factory.ts
import {
  Account,
  AccountProps,
} from 'src/domain/ecommerce/enterprise/entities/account';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { PrismaAccountMapper } from 'src/infra/database/prisma/mappers/prisma-account-mapper';
import { Injectable } from '@nestjs/common';
import { makeAccount } from '../make-account';

@Injectable()
export class AccountFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaAccount(data: Partial<AccountProps> = {}): Promise<Account> {
    const account = makeAccount(data);

    await this.prisma.account.create({
      data: PrismaAccountMapper.toPrisma(account),
    });

    return account;
  }
}

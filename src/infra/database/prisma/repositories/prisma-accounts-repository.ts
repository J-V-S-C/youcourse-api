import { AccountsRepository } from 'src/domain/e-commerce/application/repositories/accounts-repository';
import { Account } from 'src/domain/e-commerce/enterprise/entities/account';
import { PrismaService } from '../prisma.service';
import { PrismaAccountMapper } from '../mappers/prisma-account-mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaAccountsRepository implements AccountsRepository {
  constructor(private prisma: PrismaService) {}

  async create(account: Account): Promise<void> {
    const data = PrismaAccountMapper.toPrisma(account);
    await this.prisma.account.create({
      data,
    });
  }

  async findByEmail(email: string): Promise<Account | null> {
    const account = await this.prisma.account.findUnique({
      where: {
        email,
      },
    });

    if (!account) {
      return null;
    }

    return PrismaAccountMapper.toDomain(account);
  }
}

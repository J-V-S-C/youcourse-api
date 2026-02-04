import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import {
  Account,
  AccountProps,
} from 'src/domain/ecommerce/enterprise/entities/account';
import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { PrismaAccountMapper } from 'src/infra/database/prisma/mappers/prisma-account-mapper';

export function makeAccount(
  override: Partial<AccountProps> = {},
  id?: UniqueEntityID,
) {
  const account = Account.create(
    {
      name: faker.person.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      ...override,
    },
    id,
  );

  return account;
}

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

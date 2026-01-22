import { Prisma, Account as PrismaAccount } from '@prisma/client';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import {
  Account,
  AccountStatus,
} from 'src/domain/e-commerce/enterprise/entities/account';

export class PrismaAccountMapper {
  static toDomain(raw: PrismaAccount): Account {
    return Account.create({
      name: raw.name,
      email: raw.email,
      password: raw.password,
      status: raw.status as AccountStatus,
      lastLogin: raw.lastLogin,
      createdAt: raw.createdAt,
    }, new UniqueEntityID(raw.id));
  }

  static toPrisma(account: Account): Prisma.AccountUncheckedCreateInput {
    return {
      id: account.id.toString(),
      name: account.name,
      email: account.email,
      password: account.password,
      status: account.status,
      lastLogin: account.lastLogin,
      createdAt: account.createdAt,
    };
  }
}

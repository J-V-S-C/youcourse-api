import {
  Prisma,
  PasswordResetToken as PrismaPasswordResetToken,
} from '@prisma/client';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { PasswordResetToken } from 'src/domain/youcourse/enterprise/entities/password-reset-token';

export class PrismaPasswordResetTokenMapper {
  static toDomain(raw: PrismaPasswordResetToken): PasswordResetToken {
    return PasswordResetToken.create(
      {
        token: raw.token,
        accountId: new UniqueEntityID(raw.accountId),
        expiresAt: raw.expiresAt,
        usedAt: raw.usedAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(
    token: PasswordResetToken,
  ): Prisma.PasswordResetTokenUncheckedCreateInput {
    return {
      id: token.id.toString(),
      token: token.token,
      accountId: token.accountId.toString(),
      expiresAt: token.expiresAt,
      usedAt: token.usedAt,
    };
  }
}

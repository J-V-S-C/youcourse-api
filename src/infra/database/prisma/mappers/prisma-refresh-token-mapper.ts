import { Prisma, RefreshToken as PrismaRefreshToken } from '@prisma/client';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { RefreshToken } from 'src/domain/youcourse/enterprise/entities/refresh-token';

export class PrismaRefreshTokenMapper {
  static toDomain(raw: PrismaRefreshToken): RefreshToken {
    return RefreshToken.create(
      {
        token: raw.token,
        accountId: new UniqueEntityID(raw.accountId),
        expiresAt: raw.expiresAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(
    token: RefreshToken,
  ): Prisma.RefreshTokenUncheckedCreateInput {
    return {
      id: token.id.toString(),
      token: token.token,
      accountId: token.accountId.toString(),
      expiresAt: token.expiresAt,
    };
  }
}

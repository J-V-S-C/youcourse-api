import { Injectable } from '@nestjs/common';
import { RefreshTokensRepository } from 'src/domain/youcourse/application/repositories/refresh-tokens-repository';
import { RefreshToken } from 'src/domain/youcourse/enterprise/entities/refresh-token';
import { PrismaService } from '../prisma.service';
import { PrismaRefreshTokenMapper } from '../mappers/prisma-refresh-token-mapper';

@Injectable()
export class PrismaRefreshTokensRepository implements RefreshTokensRepository {
  constructor(private prisma: PrismaService) {}

  async create(token: RefreshToken): Promise<void> {
    const data = PrismaRefreshTokenMapper.toPrisma(token);
    await this.prisma.refreshToken.create({
      data,
    });
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const raw = await this.prisma.refreshToken.findUnique({
      where: {
        token,
      },
    });

    if (!raw) {
      return null;
    }

    return PrismaRefreshTokenMapper.toDomain(raw);
  }

  async deleteByAccountId(accountId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        accountId,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PasswordResetTokensRepository } from 'src/domain/youcourse/application/repositories/password-reset-tokens-repository';
import { PasswordResetToken } from 'src/domain/youcourse/enterprise/entities/password-reset-token';
import { PrismaService } from '../prisma.service';
import { PrismaPasswordResetTokenMapper } from '../mappers/prisma-password-reset-token-mapper';

@Injectable()
export class PrismaPasswordResetTokensRepository implements PasswordResetTokensRepository {
  constructor(private prisma: PrismaService) {}

  async create(token: PasswordResetToken): Promise<void> {
    const data = PrismaPasswordResetTokenMapper.toPrisma(token);
    await this.prisma.passwordResetToken.create({
      data,
    });
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    const raw = await this.prisma.passwordResetToken.findUnique({
      where: {
        token,
      },
    });

    if (!raw) {
      return null;
    }

    return PrismaPasswordResetTokenMapper.toDomain(raw);
  }

  async delete(token: PasswordResetToken): Promise<void> {
    await this.prisma.passwordResetToken.delete({
      where: {
        id: token.id.toString(),
      },
    });
  }

  async deleteByAccountID(accountId: string): Promise<void> {
    await this.prisma.passwordResetToken.deleteMany({
      where: {
        accountId,
      },
    });
  }
}

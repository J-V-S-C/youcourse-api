import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { InvalidTokenError } from '../errors/invalid-token-error';
import { AccountsRepository } from '../../repositories/accounts-repository';
import { RefreshTokensRepository } from '../../repositories/refresh-tokens-repository';
import { Encrypter } from '../../cryptography/encrypter';
import { RefreshToken } from 'src/domain/youcourse/enterprise/entities/refresh-token';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';

interface RefreshTokenUseCaseRequest {
  refreshToken: string;
}

type RefreshTokenUseCaseResponse = Either<
  InvalidTokenError,
  { accessToken: string; refreshToken: string }
>;

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly encrypter: Encrypter,
  ) {}

  async execute({
    refreshToken,
  }: RefreshTokenUseCaseRequest): Promise<RefreshTokenUseCaseResponse> {
    const existingToken =
      await this.refreshTokensRepository.findByToken(refreshToken);

    if (!existingToken || existingToken.isExpired) {
      return left(new InvalidTokenError());
    }

    const account = await this.accountsRepository.findById(
      existingToken.accountId.toString(),
    );

    if (!account) {
      return left(new InvalidTokenError());
    }

    await this.refreshTokensRepository.deleteByAccountId(account.id.toString());

    const newAccessToken = await this.encrypter.encrypt({
      sub: account.id.toString(),
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const newRefreshToken = RefreshToken.create({
      token: crypto.randomUUID(),
      accountId: new UniqueEntityID(account.id.toString()),
      expiresAt,
    });

    await this.refreshTokensRepository.create(newRefreshToken);

    return right({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken.token,
    });
  }
}

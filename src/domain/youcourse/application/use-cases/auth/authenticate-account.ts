import { Either, left, right } from 'src/core/either';
import { WrongCredentialsError } from '../errors/wrong-credentials-error';
import { HashComparer } from '../../cryptography/hash-comparer';
import { Encrypter } from '../../cryptography/encrypter';
import { AccountsRepository } from '../../repositories/accounts-repository';
import { RefreshTokensRepository } from '../../repositories/refresh-tokens-repository';
import { Injectable } from '@nestjs/common';
import { RefreshToken } from 'src/domain/youcourse/enterprise/entities/refresh-token';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';

interface AuthenticateAccountUseCaseRequest {
  email: string;
  password: string;
}

type AuthenticateAccountUseCaseResponse = Either<
  WrongCredentialsError,
  { accessToken: string; refreshToken: string }
>;

@Injectable()
export class AuthenticateAccountUseCase {
  constructor(
    private accountsRepository: AccountsRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
    private refreshTokensRepository: RefreshTokensRepository,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateAccountUseCaseRequest): Promise<AuthenticateAccountUseCaseResponse> {
    const account = await this.accountsRepository.findByEmail(email);
    if (!account) {
      return left(new WrongCredentialsError());
    }

    const isValidPassword = await this.hashComparer.compare(
      password,
      account.password,
    );

    if (!isValidPassword) {
      return left(new WrongCredentialsError());
    }

    account.updateLastLoginDate();

    const accessToken = await this.encrypter.encrypt({
      sub: account.id.toString(),
    });

    await this.refreshTokensRepository.deleteByAccountId(account.id.toString());

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshToken = RefreshToken.create({
      token: crypto.randomUUID(),
      accountId: new UniqueEntityID(account.id.toString()),
      expiresAt,
    });

    await this.refreshTokensRepository.create(refreshToken);

    return right({
      accessToken,
      refreshToken: refreshToken.token,
    });
  }
}

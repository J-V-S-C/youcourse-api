import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository';
import { InMemoryRefreshTokensRepository } from 'test/repositories/in-memory-refresh-tokens-repository';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { RefreshTokenUseCase } from './refresh-token';
import { makeAccount } from 'test/factories/make-account';
import { RefreshToken } from 'src/domain/youcourse/enterprise/entities/refresh-token';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { InvalidTokenError } from '../errors/invalid-token-error';

let inMemoryAccountsRepository: InMemoryAccountsRepository;
let inMemoryRefreshTokensRepository: InMemoryRefreshTokensRepository;
let fakeEncrypter: FakeEncrypter;
let sut: RefreshTokenUseCase;

describe('Refresh Token', () => {
  beforeEach(() => {
    inMemoryAccountsRepository = new InMemoryAccountsRepository();
    inMemoryRefreshTokensRepository = new InMemoryRefreshTokensRepository();
    fakeEncrypter = new FakeEncrypter();
    sut = new RefreshTokenUseCase(
      inMemoryAccountsRepository,
      inMemoryRefreshTokensRepository,
      fakeEncrypter,
    );
  });

  it('should be able to refresh tokens with a valid refresh token', async () => {
    const account = makeAccount();
    inMemoryAccountsRepository.items.push(account);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshToken = RefreshToken.create({
      token: 'valid-refresh-token',
      accountId: new UniqueEntityID(account.id.toString()),
      expiresAt,
    });
    inMemoryRefreshTokensRepository.items.push(refreshToken);

    const result = await sut.execute({ refreshToken: 'valid-refresh-token' });

    expect(result.isRight()).toBeTruthy();
    expect(result.value).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
    expect(inMemoryRefreshTokensRepository.items).toHaveLength(1);
    expect(inMemoryRefreshTokensRepository.items[0].token).not.toBe(
      'valid-refresh-token',
    );
  });

  it('should not be able to refresh with an invalid token', async () => {
    const result = await sut.execute({ refreshToken: 'non-existent-token' });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(InvalidTokenError);
  });

  it('should not be able to refresh with an expired token', async () => {
    const account = makeAccount();
    inMemoryAccountsRepository.items.push(account);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() - 1);

    const expiredToken = RefreshToken.create({
      token: 'expired-refresh-token',
      accountId: new UniqueEntityID(account.id.toString()),
      expiresAt,
    });
    inMemoryRefreshTokensRepository.items.push(expiredToken);

    const result = await sut.execute({
      refreshToken: 'expired-refresh-token',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(InvalidTokenError);
  });
});

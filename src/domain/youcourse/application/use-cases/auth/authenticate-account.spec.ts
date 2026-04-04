import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository';
import { InMemoryRefreshTokensRepository } from 'test/repositories/in-memory-refresh-tokens-repository';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { AuthenticateAccountUseCase } from './authenticate-account';
import { WrongCredentialsError } from '../errors/wrong-credentials-error';
import { makeAccount } from 'test/factories/make-account';

let inMemoryAccountsRepository: InMemoryAccountsRepository;
let inMemoryRefreshTokensRepository: InMemoryRefreshTokensRepository;
let fakeHasher: FakeHasher;
let fakeEncrypter: FakeEncrypter;
let sut: AuthenticateAccountUseCase;

describe('Authenticate Account', () => {
  beforeEach(() => {
    inMemoryAccountsRepository = new InMemoryAccountsRepository();
    inMemoryRefreshTokensRepository = new InMemoryRefreshTokensRepository();
    fakeHasher = new FakeHasher();
    fakeEncrypter = new FakeEncrypter();
    sut = new AuthenticateAccountUseCase(
      inMemoryAccountsRepository,
      fakeHasher,
      fakeEncrypter,
      inMemoryRefreshTokensRepository,
    );
  });

  it('should be able to authenticate an account and receive both tokens', async () => {
    const account = makeAccount({
      email: 'jhon@example.com',
      password: await fakeHasher.hash('pass123'),
    });

    await inMemoryAccountsRepository.create(account);

    const result = await sut.execute({
      email: 'jhon@example.com',
      password: 'pass123',
    });

    expect(result.isRight()).toBeTruthy();
    expect(result.value).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
    expect(inMemoryRefreshTokensRepository.items).toHaveLength(1);
  });

  it('should replace the existing refresh token on a new login', async () => {
    const account = makeAccount({
      email: 'jhon@example.com',
      password: await fakeHasher.hash('pass123'),
    });
    await inMemoryAccountsRepository.create(account);

    await sut.execute({ email: 'jhon@example.com', password: 'pass123' });
    await sut.execute({ email: 'jhon@example.com', password: 'pass123' });

    expect(inMemoryRefreshTokensRepository.items).toHaveLength(1);
  });

  it('should not be able to authenticate if email does not exist', async () => {
    const result = await sut.execute({
      email: 'invalid@example.com',
      password: 'pass123',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(WrongCredentialsError);
  });

  it('should not be able to authenticate with an invalid password', async () => {
    const account = makeAccount({
      email: 'jhon@example.com',
      password: await fakeHasher.hash('pass123'),
    });
    await inMemoryAccountsRepository.create(account);

    const result = await sut.execute({
      email: 'jhon@example.com',
      password: 'wrong-pass',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(WrongCredentialsError);
  });
});

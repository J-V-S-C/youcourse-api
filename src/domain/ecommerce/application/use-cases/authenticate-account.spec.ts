import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository';
import { AuthenticateAccountUseCase } from './authenticate-account';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { Encrypter } from '../cryptography/encrypter';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { WrongCredentialsError } from './errors/wrong-credentials-error';
import { makeAccount } from 'test/factories/make-account';

let inMemoryAccountsRepository: InMemoryAccountsRepository;
let fakeHasher: FakeHasher;
let encrypter: Encrypter;
let sut: AuthenticateAccountUseCase;

describe('Authenticate Account', () => {
  beforeEach(() => {
    inMemoryAccountsRepository = new InMemoryAccountsRepository();
    fakeHasher = new FakeHasher();
    encrypter = new FakeEncrypter();
    sut = new AuthenticateAccountUseCase(
      inMemoryAccountsRepository,
      fakeHasher,
      encrypter,
    );
  });

  it('should be able to authenticate an account with valid credentials', async () => {
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
    });
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
      password: 'invalid-pass',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(WrongCredentialsError);
  });
});

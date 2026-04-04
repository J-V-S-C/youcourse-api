import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository';
import { RegisterAccountUseCase } from './register-account';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { AccountAlreadyExistsError } from '../errors/account-already-exists-error';

let inMemoryAccountsRepository: InMemoryAccountsRepository;
let fakeHasher: FakeHasher;

let sut: RegisterAccountUseCase;

describe('Register Account', () => {
  beforeEach(() => {
    inMemoryAccountsRepository = new InMemoryAccountsRepository();
    fakeHasher = new FakeHasher();
    sut = new RegisterAccountUseCase(inMemoryAccountsRepository, fakeHasher);
  });

  it('should be able to register a new account', async () => {
    const result = await sut.execute({
      name: 'Jhon Doe',
      email: 'jhon@example.com',
      password: 'pass123',
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryAccountsRepository.items).toHaveLength(1);
    expect(result.value).toMatchObject({
      account: expect.objectContaining({
        email: 'jhon@example.com',
      }),
    });
  });

  it('should hash the account password before saving', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'pass123',
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryAccountsRepository.items[0].password).toBe('pass123-hashed');
  });

  it('should not allow registering two accounts with the same email', async () => {
    await sut.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'pass123',
    });

    const result = await sut.execute({
      name: 'Jane Doe',
      email: 'john@example.com',
      password: 'pass123',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AccountAlreadyExistsError);
    expect(inMemoryAccountsRepository.items).toHaveLength(1);
  });
});

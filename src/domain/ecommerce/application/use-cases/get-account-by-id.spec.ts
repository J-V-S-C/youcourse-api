import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository';
import { makeAccount } from 'test/factories/make-account';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { GetAccountByIdUseCase } from './get-account-by-id';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';

let inMemoryAccountsRepository: InMemoryAccountsRepository;
let sut: GetAccountByIdUseCase;

describe('Get account by id', () => {
  beforeEach(() => {
    inMemoryAccountsRepository = new InMemoryAccountsRepository();
    sut = new GetAccountByIdUseCase(inMemoryAccountsRepository);
  });
  it('should return account when requester owns the account', async () => {
    const account = makeAccount({}, new UniqueEntityID('account-1'));

    await inMemoryAccountsRepository.create(account);

    const result = await sut.execute({
      id: 'account-1',
      requesterId: 'account-1',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(
      expect.objectContaining({
        account: expect.objectContaining({
          id: new UniqueEntityID('account-1'),
        }),
      }),
    );
  });

  it('should not allow access when requester is not the owner', async () => {
    const account = makeAccount({}, new UniqueEntityID('account-1'));

    await inMemoryAccountsRepository.create(account);

    const result = await sut.execute({
      id: 'account-1',
      requesterId: 'other-user',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it('should return error when account does not exist', async () => {
    const result = await sut.execute({
      id: 'non-existent-id',
      requesterId: 'non-existent-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});

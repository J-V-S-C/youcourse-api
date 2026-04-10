import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository';
import { EditAccountDetailsUseCase } from './edit-account-details';
import { makeAccount } from 'test/factories/make-account';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { JwtService } from '@nestjs/jwt';
import { AccountAlreadyExistsError } from '../errors/account-already-exists-error';

let inMemoryAccountsRepository: InMemoryAccountsRepository;
let sut: EditAccountDetailsUseCase;

describe('Edit Account Details', () => {
  beforeEach(() => {
    inMemoryAccountsRepository = new InMemoryAccountsRepository();
    sut = new EditAccountDetailsUseCase(inMemoryAccountsRepository);
  });

  it('should be able to edit the account details', async () => {
    const account = makeAccount();
    inMemoryAccountsRepository.items.push(account);

    const result = await sut.execute({
      accountId: account.id.toString(),
      name: 'new name',
      email: 'new email',
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryAccountsRepository.items[0]).toMatchObject({
      name: 'new name',
      email: 'new email',
    });
  });
  it('should not be able to edit a non existent account', async () => {
    const result = await sut.execute({
      accountId: 'fake-id',
      name: 'new name',
      email: 'new email',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to change your email to an existing email', async () => {
    const existingAccount = makeAccount();
    inMemoryAccountsRepository.items.push(existingAccount);

    const newAccount = makeAccount();
    inMemoryAccountsRepository.items.push(newAccount);

    const result = await sut.execute({
      accountId: newAccount.id.toString(),
      name: 'new name',
      email: existingAccount.email,
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(AccountAlreadyExistsError);
  });
});

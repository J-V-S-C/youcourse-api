import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository';
import { InMemoryPasswordResetTokensRepository } from 'test/repositories/in-memory-password-reset-tokens-repository';
import { FakeEmailService } from 'test/services/fake-email-service';
import { EditPasswordUseCase } from './edit-password';
import { makeAccount } from 'test/factories/make-account';
import { PasswordResetToken } from 'src/domain/youcourse/enterprise/entities/password-reset-token';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { InvalidTokenError } from '../errors/invalid-token-error';
import { FakeHasher } from 'test/cryptography/fake-hasher';

let inMemoryAccountsRepository: InMemoryAccountsRepository;
let inMemoryPasswordResetTokensRepository: InMemoryPasswordResetTokensRepository;
let fakeEmailService: FakeEmailService;
let fakeHasher: FakeHasher;
let sut: EditPasswordUseCase;

describe('Edit Password', () => {
  beforeEach(() => {
    inMemoryAccountsRepository = new InMemoryAccountsRepository();
    inMemoryPasswordResetTokensRepository =
      new InMemoryPasswordResetTokensRepository();
    fakeEmailService = new FakeEmailService();
    fakeHasher = new FakeHasher();
    sut = new EditPasswordUseCase(
      inMemoryAccountsRepository,
      inMemoryPasswordResetTokensRepository,
      fakeEmailService,
      fakeHasher,
    );
  });

  it('should be able to change the password with a valid token and send a confirmation email', async () => {
    const account = makeAccount({ email: 'user@example.com' });
    inMemoryAccountsRepository.items.push(account);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const token = PasswordResetToken.create({
      token: 'valid-token',
      accountId: new UniqueEntityID(account.id.toString()),
      expiresAt,
    });
    inMemoryPasswordResetTokensRepository.items.push(token);

    const result = await sut.execute({
      token: 'valid-token',
      newPassword: 'new-secure-password',
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryPasswordResetTokensRepository.items).toHaveLength(0);
    expect(fakeEmailService.sent).toHaveLength(1);
    expect(fakeEmailService.sent[0]).toMatchObject({
      to: 'user@example.com',
      subject: 'Your Password Has Been Changed',
    });
  });

  it('should not be able to change the password with an invalid token', async () => {
    const result = await sut.execute({
      token: 'non-existent-token',
      newPassword: 'new-secure-password',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(InvalidTokenError);
    expect(fakeEmailService.sent).toHaveLength(0);
  });

  it('should not be able to change the password with an expired token', async () => {
    const account = makeAccount();
    inMemoryAccountsRepository.items.push(account);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() - 1);

    const expiredToken = PasswordResetToken.create({
      token: 'expired-token',
      accountId: new UniqueEntityID(account.id.toString()),
      expiresAt,
    });
    inMemoryPasswordResetTokensRepository.items.push(expiredToken);

    const result = await sut.execute({
      token: 'expired-token',
      newPassword: 'new-secure-password',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(InvalidTokenError);
    expect(fakeEmailService.sent).toHaveLength(0);
  });
});

import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository';
import { InMemoryPasswordResetTokensRepository } from 'test/repositories/in-memory-password-reset-tokens-repository';
import { FakeEmailService } from 'test/services/fake-email-service';
import { FakeTokenGenerator } from 'test/cryptography/fake-token-generator';
import { RequestPasswordResetUseCase } from './request-password-reset';
import { makeAccount } from 'test/factories/make-account';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

let inMemoryAccountsRepository: InMemoryAccountsRepository;
let inMemoryPasswordResetTokensRepository: InMemoryPasswordResetTokensRepository;
let fakeEmailService: FakeEmailService;
let sut: RequestPasswordResetUseCase;

describe('Request Password Reset', () => {
  beforeEach(() => {
    inMemoryAccountsRepository = new InMemoryAccountsRepository();
    inMemoryPasswordResetTokensRepository =
      new InMemoryPasswordResetTokensRepository();
    fakeEmailService = new FakeEmailService();
    sut = new RequestPasswordResetUseCase(
      inMemoryAccountsRepository,
      inMemoryPasswordResetTokensRepository,
      fakeEmailService,
    );
  });

  it('should be able to request a password reset and send a confirmation email', async () => {
    const account = makeAccount({ email: 'user@example.com' });
    inMemoryAccountsRepository.items.push(account);

    const result = await sut.execute({ email: 'user@example.com' });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryPasswordResetTokensRepository.items).toHaveLength(1);
    expect(fakeEmailService.sent).toHaveLength(1);
    expect(fakeEmailService.sent[0]).toMatchObject({
      to: 'user@example.com',
      subject: 'Password Reset Request',
    });
  });

  it('should not be able to request a reset for a non existent email', async () => {
    const result = await sut.execute({ email: 'ghost@example.com' });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    expect(inMemoryPasswordResetTokensRepository.items).toHaveLength(0);
    expect(fakeEmailService.sent).toHaveLength(0);
  });
});

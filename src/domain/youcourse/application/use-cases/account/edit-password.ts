import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { InvalidTokenError } from '../errors/invalid-token-error';
import type { Account } from 'src/domain/youcourse/enterprise/entities/account';
import { AccountsRepository } from '../../repositories/accounts-repository';
import { PasswordResetTokensRepository } from '../../repositories/password-reset-tokens-repository';
import { EmailService } from '../../services/emailService';

interface EditPasswordUseCaseRequest {
  token: string;
  newPassword: string;
}

type EditPasswordUseCaseResponse = Either<
  ResourceNotFoundError | InvalidTokenError,
  { account: Account }
>;

@Injectable()
export class EditPasswordUseCase {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly passwordResetTokensRepository: PasswordResetTokensRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute({
    token,
    newPassword,
  }: EditPasswordUseCaseRequest): Promise<EditPasswordUseCaseResponse> {
    const passwordResetToken =
      await this.passwordResetTokensRepository.findByToken(token);

    if (!passwordResetToken || passwordResetToken.isExpired) {
      return left(new InvalidTokenError());
    }

    const account = await this.accountsRepository.findById(
      passwordResetToken.accountId.toString(),
    );

    if (!account) {
      return left(new ResourceNotFoundError());
    }

    account.updatePassword(newPassword);

    await this.accountsRepository.save(account);

    await this.passwordResetTokensRepository.delete(passwordResetToken);

    await this.emailService.sendMail({
      to: account.email,
      subject: 'Your Password Has Been Changed',
      body: 'Your password was successfully updated. If you did not make this change, please contact support immediately.',
    });

    return right({ account });
  }
}

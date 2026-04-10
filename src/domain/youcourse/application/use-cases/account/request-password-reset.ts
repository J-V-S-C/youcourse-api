import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { AccountsRepository } from '../../repositories/accounts-repository';
import { PasswordResetTokensRepository } from '../../repositories/password-reset-tokens-repository';
import { TokenGenerator } from '../../cryptography/token-generator';
import { EmailService } from '../../services/emailService';
import { PasswordResetToken } from 'src/domain/youcourse/enterprise/entities/password-reset-token';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { randomInt } from 'crypto';

interface RequestPasswordResetUseCaseRequest {
  email: string;
}

type RequestPasswordResetUseCaseResponse = Either<
  ResourceNotFoundError,
  object
>;

@Injectable()
export class RequestPasswordResetUseCase {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly passwordResetTokensRepository: PasswordResetTokensRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute({
    email,
  }: RequestPasswordResetUseCaseRequest): Promise<RequestPasswordResetUseCaseResponse> {
    const account = await this.accountsRepository.findByEmail(email);
    if (!account) {
      return left(new ResourceNotFoundError());
    }

    const rawToken = randomInt(100000, 999999).toString();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    const passwordResetToken = PasswordResetToken.create({
      token: rawToken,
      accountId: new UniqueEntityID(account.id.toString()),
      expiresAt,
    });

    await this.passwordResetTokensRepository.deleteByAccountID(
      account.id.toString(),
    );
    await this.passwordResetTokensRepository.create(passwordResetToken);

    await this.emailService.sendMail({
      to: account.email,
      subject: 'Password Reset Request',
      body: `You requested a password reset. Use this token to confirm: ${rawToken}. It expires in 5 minutes. If you did not request this, please ignore this email.`,
    });

    return right({});
  }
}

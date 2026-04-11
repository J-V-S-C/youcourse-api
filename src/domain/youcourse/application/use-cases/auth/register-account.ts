import { Either, left, right } from 'src/core/either';
import { Account } from 'src/domain/youcourse/enterprise/entities/account';
import { AccountAlreadyExistsError } from '../errors/account-already-exists-error';
import { HashGenerator } from '../../cryptography/hash-generator';
import { AccountsRepository } from '../../repositories/accounts-repository';
import { Injectable } from '@nestjs/common';
import { InvalidPasswordLengthError } from '../errors/invalidPasswordLengthError';

interface RegisterAccountUseCaseRequest {
  name: string;
  email: string;
  password: string;
}

type RegisterAccountUseCaseResponse = Either<
  AccountAlreadyExistsError,
  { account: Account }
>;

@Injectable()
export class RegisterAccountUseCase {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute({
    name,
    email,
    password,
  }: RegisterAccountUseCaseRequest): Promise<RegisterAccountUseCaseResponse> {
    const existingAccount = await this.accountsRepository.findByEmail(email);

    if (existingAccount) {
      return left(new AccountAlreadyExistsError(email));
    }

    if (password.length <= 6) {
      return left(new InvalidPasswordLengthError());
    }

    const hashedPassword = await this.hashGenerator.hash(password);
    const account = Account.create({
      name,
      email,
      password: hashedPassword,
    });
    await this.accountsRepository.create(account);

    return right({
      account,
    });
  }
}

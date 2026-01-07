import { Either, left, right } from 'src/core/either';
import { Account } from '../../enterprise/entities/account';
import { AccountAlreadyExistsError } from './errors/account-already-exists-error';
import { HashGenerator } from '../cryptography/hash-generator';
import { AccountsRepository } from '../repositories/accounts-repository';

interface RegisterAccountUseCaseRequest {
  name: string;
  email: string;
  password: string;
}

type RegisterAccountUseCaseResponse = Either<
  AccountAlreadyExistsError,
  { account: Account }
>;

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

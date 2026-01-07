import { Either, left, right } from 'src/core/either';
import { SellersRepository } from '../repositories/accounts-repository';
import { WrongCredentialsError } from './errors/wrong-credentials-error';
import { HashComparer } from '../cryptography/hash-comparer';
import { Encrypter } from '../cryptography/encrypter';

interface AuthenticateAccountUseCaseRequest {
  email: string;
  password: string;
}

type AuthenticateAccountUseCaseResponse = Either<
  WrongCredentialsError,
  { accessToken: string }
>;

export class AuthenticateAccountUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateAccountUseCaseRequest): Promise<AuthenticateAccountUseCaseResponse> {
    const seller = await this.sellersRepository.findByEmail(email);
    if (!seller) {
      return left(new WrongCredentialsError());
    }

    const isValidPassword = await this.hashComparer.compare(
      password,
      seller.password,
    );

    if (!isValidPassword) {
      return left(new WrongCredentialsError());
    }

    const accessToken = await this.encrypter.encrypt({
      sub: seller.id.toString(),
    });

    return right({
      accessToken,
    });
  }
}

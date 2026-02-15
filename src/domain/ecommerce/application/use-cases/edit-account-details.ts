import { Either, left, right } from 'src/core/either';
import { Account } from '../../enterprise/entities/account';
import { AccountsRepository } from '../repositories/accounts-repository';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { Injectable } from '@nestjs/common';

interface EditAccountDetailsUseCaseRequest {
  accountId: string;
  name?: string;
  email?: string;
}

type EditAccountDetailsUseCaseResponse = Either<
  ResourceNotFoundError,
  { account: Account }
>;

@Injectable()
export class EditAccountDetailsUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute({
    accountId,
    name,
    email,
  }: EditAccountDetailsUseCaseRequest): Promise<EditAccountDetailsUseCaseResponse> {
    const account = await this.accountsRepository.findById(accountId);
    if (!account) {
      return left(new ResourceNotFoundError());
    }

    account.updateDetails(name ?? account.name, email ?? account.email);

    await this.accountsRepository.save(account);

    return right({
      account,
    });
  }
}

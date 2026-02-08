import { Either, left, right } from 'src/core/either';
import { AccountsRepository } from '../repositories/accounts-repository';
import { Injectable } from '@nestjs/common';
import { Account } from '../../enterprise/entities/account';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';

interface GetAccountByIdUseCaseRequest {
  id: string;
  requesterId: string;
}

type GetAccountByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  { account: Account }
>;

@Injectable()
export class GetAccountByIdUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute({
    id,
    requesterId,
  }: GetAccountByIdUseCaseRequest): Promise<GetAccountByIdUseCaseResponse> {
    if (id != requesterId) {
      return left(new NotAllowedError());
    }

    const account = await this.accountsRepository.findById(id);

    if (!account) {
      return left(new ResourceNotFoundError());
    }

    return right({
      account,
    });
  }
}

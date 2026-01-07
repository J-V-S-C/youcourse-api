import { AccountsRepository } from 'src/domain/e-commerce/application/repositories/accounts-repository';
import { Account } from 'src/domain/e-commerce/enterprise/entities/account';

export class InMemoryAccountsRepository implements AccountsRepository {
  public items: Account[] = [];

  async create(account: Account): Promise<void> {
    this.items.push(account);
  }

  async findByEmail(email: string): Promise<Account | null> {
    return this.items.find((account) => account.email === email) ?? null;
  }
}

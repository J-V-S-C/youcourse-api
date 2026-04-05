import { AccountsRepository } from 'src/domain/youcourse/application/repositories/accounts-repository';
import { Account } from 'src/domain/youcourse/enterprise/entities/account';

export class InMemoryAccountsRepository implements AccountsRepository {
  public items: Account[] = [];

  async create(account: Account): Promise<void> {
    this.items.push(account);
  }

  async save(account: Account): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === account.id);
    this.items[itemIndex] = account;
  }

  async findByEmail(email: string): Promise<Account | null> {
    return this.items.find((account) => account.email === email) ?? null;
  }

  async findById(id: string): Promise<Account | null> {
    return this.items.find((account) => account.id.toString() === id) ?? null;
  }
}

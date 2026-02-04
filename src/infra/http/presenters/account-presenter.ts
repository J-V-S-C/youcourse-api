import { Account } from 'src/domain/ecommerce/enterprise/entities/account';

export class AccountPresenter {
  static toHTTP(account: Account) {
    return {
      id: account.id.toString(),
      name: account.name,
      email: account.email,
      status: account.status,
      createdAt: account.createdAt,
      lastLogin: account.lastLogin,
    };
  }
}

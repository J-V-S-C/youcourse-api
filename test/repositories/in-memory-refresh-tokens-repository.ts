import { RefreshToken } from 'src/domain/youcourse/enterprise/entities/refresh-token';
import { RefreshTokensRepository } from 'src/domain/youcourse/application/repositories/refresh-tokens-repository';

export class InMemoryRefreshTokensRepository implements RefreshTokensRepository {
  public items: RefreshToken[] = [];

  async create(token: RefreshToken): Promise<void> {
    this.items.push(token);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.items.find((item) => item.token === token) ?? null;
  }

  async deleteByAccountId(accountId: string): Promise<void> {
    this.items = this.items.filter(
      (item) => item.accountId.toString() !== accountId,
    );
  }
}

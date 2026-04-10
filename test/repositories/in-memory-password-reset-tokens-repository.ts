import { PasswordResetToken } from 'src/domain/youcourse/enterprise/entities/password-reset-token';
import { PasswordResetTokensRepository } from 'src/domain/youcourse/application/repositories/password-reset-tokens-repository';

export class InMemoryPasswordResetTokensRepository implements PasswordResetTokensRepository {
  public items: PasswordResetToken[] = [];

  async create(token: PasswordResetToken): Promise<void> {
    this.items.push(token);
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    return this.items.find((item) => item.token === token) ?? null;
  }

  async delete(token: PasswordResetToken): Promise<void> {
    this.items = this.items.filter((item) => item.token !== token.token);
  }

  async deleteByAccountID(): Promise<void> {
    this.items = [];
  }
}

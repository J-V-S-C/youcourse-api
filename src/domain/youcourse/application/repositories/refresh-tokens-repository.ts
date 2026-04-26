import { RefreshToken } from '../../enterprise/entities/refresh-token';

export abstract class RefreshTokensRepository {
  abstract create(token: RefreshToken): Promise<void>;
  abstract findByToken(token: string): Promise<RefreshToken | null>;
  abstract deleteByAccountId(accountId: string): Promise<void>;
}

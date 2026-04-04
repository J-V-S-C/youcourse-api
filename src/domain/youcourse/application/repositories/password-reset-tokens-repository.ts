import { PasswordResetToken } from '../../enterprise/entities/password-reset-token';

export abstract class PasswordResetTokensRepository {
  abstract create(token: PasswordResetToken): Promise<void>;
  abstract findByToken(token: string): Promise<PasswordResetToken | null>;
  abstract delete(token: PasswordResetToken): Promise<void>;
}

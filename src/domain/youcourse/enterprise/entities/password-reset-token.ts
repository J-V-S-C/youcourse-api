import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Optional } from 'src/core/types/optional';

export interface PasswordResetTokenProps {
  token: string;
  accountId: UniqueEntityID;
  expiresAt: Date;
  usedAt?: Date | null;
}

export class PasswordResetToken extends Entity<PasswordResetTokenProps> {
  get token() {
    return this.props.token;
  }

  get accountId() {
    return this.props.accountId;
  }

  get expiresAt() {
    return this.props.expiresAt;
  }

  get usedAt() {
    return this.props.usedAt;
  }

  get isExpired() {
    return new Date() > this.props.expiresAt;
  }

  markAsUsed() {
    this.props.usedAt = new Date();
  }

  static create(
    props: Optional<PasswordResetTokenProps, 'usedAt'>,
    id?: UniqueEntityID,
  ) {
    return new PasswordResetToken(
      {
        ...props,
        usedAt: props.usedAt ?? null,
      },
      id,
    );
  }
}

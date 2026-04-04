import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';

export interface RefreshTokenProps {
  token: string;
  accountId: UniqueEntityID;
  expiresAt: Date;
}

export class RefreshToken extends Entity<RefreshTokenProps> {
  get token() {
    return this.props.token;
  }

  get accountId() {
    return this.props.accountId;
  }

  get expiresAt() {
    return this.props.expiresAt;
  }

  get isExpired() {
    return new Date() > this.props.expiresAt;
  }

  static create(props: RefreshTokenProps, id?: UniqueEntityID) {
    return new RefreshToken(props, id);
  }
}

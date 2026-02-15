import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Optional } from 'src/core/types/optional';

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DISABLED = 'DISABLED',
}

export interface AccountProps {
  name: string;
  email: string;
  password: string;
  status: AccountStatus;
  createdAt: Date;
  lastLogin?: Date | null;
}

export class Account extends Entity<AccountProps> {
  get name() {
    return this.props.name;
  }

  get email() {
    return this.props.email;
  }

  get password() {
    return this.props.password;
  }

  get status() {
    return this.props.status;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get lastLogin() {
    return this.props.lastLogin;
  }

  updateLastLoginDate() {
    this.props.lastLogin = new Date();
  }

  updateDetails(name: string, email: string) {
    this.props.name = name;
    this.props.email = email;
  }

  static create(
    props: Optional<AccountProps, 'createdAt' | 'status'>,
    id?: UniqueEntityID,
  ) {
    const account = new Account(
      {
        ...props,
        status: props.status ?? AccountStatus.ACTIVE,
        createdAt: props.createdAt ?? new Date(),
        lastLogin: props.lastLogin ?? null,
      },
      id,
    );

    return account;
  }
}

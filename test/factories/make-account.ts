import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import {
  Account,
  AccountProps,
} from 'src/domain/e-commerce/enterprise/entities/account';
import { faker } from '@faker-js/faker';

export function makeAccount(
  override: Partial<AccountProps> = {},
  id?: UniqueEntityID,
) {
  const account = Account.create(
    {
      name: faker.person.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      ...override,
    },
    id,
  );

  return account;
}

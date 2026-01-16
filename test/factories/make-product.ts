import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import {
  Product,
  ProductProps,
} from 'src/domain/e-commerce/enterprise/entities/product';
import { faker } from '@faker-js/faker';
import { Price } from 'src/domain/e-commerce/enterprise/entities/value-objects/price';

export function makeProduct(
  override: Partial<ProductProps> = {},
  id?: UniqueEntityID,
) {
  const product = Product.create(
    {
      name: faker.person.firstName(),
      description: faker.commerce.productDescription(),
      price: Price.create({
        amount: faker.number.float({ min: 0.01, fractionDigits: 2 }),
        currency: faker.finance.currencyCode(),
      }),
      creatorId: new UniqueEntityID(),
      ...override,
    },
    id,
  );

  return product;
}

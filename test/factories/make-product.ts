import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import {
  Product,
  ProductProps,
} from 'src/domain/e-commerce/enterprise/entities/product';
import { faker } from '@faker-js/faker';
import { Price } from 'src/domain/e-commerce/enterprise/entities/value-objects/price';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { PrismaProductMapper } from 'src/infra/database/prisma/mappers/prisma-product-mapper';

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

@Injectable()
export class ProductFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaProduct(data: Partial<ProductProps> = {}): Promise<Product> {
    const product = makeProduct(data);

    await this.prisma.product.create({
      data: PrismaProductMapper.toPrisma(product),
    });

    return product;
  }
}

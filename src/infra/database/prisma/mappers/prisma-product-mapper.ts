import { Prisma, Product as PrismaProduct } from '@prisma/client';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Product } from 'src/domain/e-commerce/enterprise/entities/product';
import { Price } from 'src/domain/e-commerce/enterprise/entities/value-objects/price';

export class PrismaProductMapper {
  static toDomain(raw: PrismaProduct): Product {
    return Product.create(
      {
        name: raw.name,
        description: raw.description,
        creatorId: new UniqueEntityID(raw.creatorId),
        price: raw.price
          ? Price.create(raw.price as { amount: number; currency: string })
          : undefined,
        sellable: raw.sellable,
        visible: raw.visible,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(product: Product): Prisma.ProductUncheckedCreateInput {
    return {
      name: product.name,
      description: product.description,
      creatorId: product.creatorId.toString(),
      price: product.price ? product.price?.toJSON() : Prisma.JsonNull,
      sellable: product.sellable,
      visible: product.visible,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}

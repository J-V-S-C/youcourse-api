import { Injectable } from '@nestjs/common';
import {
  Product,
  ProductProps,
} from 'src/domain/ecommerce/enterprise/entities/product';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { makeProduct } from '../make-product';
import { PrismaProductMapper } from 'src/infra/database/prisma/mappers/prisma-product-mapper';

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

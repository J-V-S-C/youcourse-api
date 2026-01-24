import { ProductsRepository } from 'src/domain/e-commerce/application/repositories/products-repository';
import { Product } from 'src/domain/e-commerce/enterprise/entities/product';
import { PrismaService } from '../prisma.service';
import { PrismaProductMapper } from '../mappers/prisma-product-mapper';
import { Injectable } from '@nestjs/common';
import { PaginationParams } from 'src/core/repositories/pagination-params';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaProductsRepository implements ProductsRepository {
  constructor(private prisma: PrismaService) {}

  async create(product: Product): Promise<void> {
    const data = PrismaProductMapper.toPrisma(product);
    await this.prisma.product.create({
      data,
    });
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return null;
    }

    return PrismaProductMapper.toDomain(product);
  }

  async findMany({
    page,
    perPage,
    orderBy,
  }: PaginationParams): Promise<Product[]> {
    const orderByMap = {
      recent: { createdAt: 'desc' },
      bestSelling: { metrics: { sales: 'desc' } },
      popular: { metrics: { score: 'desc' } },
    } satisfies Record<string, Prisma.ProductOrderByWithRelationInput>;
    const orderByClause = orderByMap[orderBy];
    if (!orderByClause) return [];

    const skip = (page - 1) * perPage;
    const products = await this.prisma.product.findMany({
      orderBy: orderByClause,
      skip,
      take: perPage,
    });

    return products.map(PrismaProductMapper.toDomain);
  }

  async save(product: Product): Promise<void> {}

  async delete(product: Product): Promise<void> {}
}

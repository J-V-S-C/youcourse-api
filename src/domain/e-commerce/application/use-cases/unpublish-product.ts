import { Either, left, right } from 'src/core/either';
import { Product } from '../../enterprise/entities/product';
import { ProductsRepository } from '../repositories/products-repository';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { Injectable } from '@nestjs/common';

interface UnpublishProductUseCaseRequest {
  productId: string;
  creatorId: string;
}

type UnpublishProductUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  { product: Product }
>;

@Injectable()
export class UnpublishProductUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({
    productId,
    creatorId,
  }: UnpublishProductUseCaseRequest): Promise<UnpublishProductUseCaseResponse> {
    const product = await this.productsRepository.findById(productId);
    if (!product) {
      return left(new ResourceNotFoundError());
    }

    if (creatorId != product.creatorId.toString()) {
      return left(new NotAllowedError());
    }

    product.unpublish();

    await this.productsRepository.save(product);

    return right({
      product,
    });
  }
}

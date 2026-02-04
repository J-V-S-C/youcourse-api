import { Either, left, right } from 'src/core/either';
import { Product } from '../../enterprise/entities/product';
import { Price } from '../../enterprise/entities/value-objects/price';
import { ProductsRepository } from '../repositories/products-repository';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { Injectable } from '@nestjs/common';

interface DeleteProductUseCaseRequest {
  productId: string;
  creatorId: string;
}

type DeleteProductUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  object
>;

@Injectable()
export class DeleteProductUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({
    productId,
    creatorId,
  }: DeleteProductUseCaseRequest): Promise<DeleteProductUseCaseResponse> {
    const product = await this.productsRepository.findById(productId);
    if (!product) {
      return left(new ResourceNotFoundError());
    }

    if (creatorId != product.creatorId.toString()) {
      return left(new NotAllowedError());
    }

    await this.productsRepository.delete(product);

    return right({});
  }
}

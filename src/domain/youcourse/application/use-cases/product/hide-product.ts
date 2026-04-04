import { Either, left, right } from 'src/core/either';
import { Product } from 'src/domain/youcourse/enterprise/entities/product';
import { ProductsRepository } from '../../repositories/products-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { Injectable } from '@nestjs/common';

interface HideProductUseCaseRequest {
  productId: string;
  creatorId: string;
}

type HideProductUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  { product: Product }
>;

@Injectable()
export class HideProductUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({
    productId,
    creatorId,
  }: HideProductUseCaseRequest): Promise<HideProductUseCaseResponse> {
    const product = await this.productsRepository.findById(productId);
    if (!product) {
      return left(new ResourceNotFoundError());
    }

    if (creatorId != product.creatorId.toString()) {
      return left(new NotAllowedError());
    }

    product.hide();

    await this.productsRepository.save(product);

    return right({
      product,
    });
  }
}

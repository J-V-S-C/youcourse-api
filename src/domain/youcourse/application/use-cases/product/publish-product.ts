import { Either, left, right } from 'src/core/either';
import { Product } from 'src/domain/youcourse/enterprise/entities/product';
import { ProductsRepository } from '../../repositories/products-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { Price } from 'src/domain/youcourse/enterprise/entities/value-objects/price';
import { Injectable } from '@nestjs/common';

interface PublishProductUseCaseRequest {
  productId: string;
  creatorId: string;
  price: Price;
}

type PublishProductUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  { product: Product }
>;
@Injectable()
export class PublishProductUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({
    productId,
    creatorId,
    price,
  }: PublishProductUseCaseRequest): Promise<PublishProductUseCaseResponse> {
    const product = await this.productsRepository.findById(productId);
    if (!product) {
      return left(new ResourceNotFoundError());
    }

    if (creatorId != product.creatorId.toString()) {
      return left(new NotAllowedError());
    }

    product.updatePrice(price);
    product.publish();

    await this.productsRepository.save(product);

    return right({
      product,
    });
  }
}

import { Either, left, right } from 'src/core/either';
import { Product } from '../../enterprise/entities/product';
import { Price } from '../../enterprise/entities/value-objects/price';
import { ProductsRepository } from '../repositories/products-repository';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { Injectable } from '@nestjs/common';

interface UpdateProductPriceUseCaseRequest {
  productId: string;
  creatorId: string;
  price: Price;
}

type UpdateProductPriceUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  { product: Product }
>;

@Injectable()
export class UpdateProductPriceUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({
    productId,
    creatorId,
    price,
  }: UpdateProductPriceUseCaseRequest): Promise<UpdateProductPriceUseCaseResponse> {
    const product = await this.productsRepository.findById(productId);
    if (!product) {
      return left(new ResourceNotFoundError());
    }

    if (creatorId != product.creatorId.toString()) {
      return left(new NotAllowedError());
    }

    try {
      product.updatePrice(price);
    } catch {
      return left(new NotAllowedError());
    }

    await this.productsRepository.save(product);

    return right({
      product,
    });
  }
}

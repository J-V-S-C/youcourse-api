import { Either, left, right } from 'src/core/either';
import { Product } from 'src/domain/youcourse/enterprise/entities/product';
import { Price } from 'src/domain/youcourse/enterprise/entities/value-objects/price';
import { ProductsRepository } from '../../repositories/products-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { Injectable } from '@nestjs/common';

interface EditProductDetailsUseCaseRequest {
  productId: string;
  creatorId: string;
  name?: string;
  description?: string;
}

type EditProductDetailsUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  { product: Product }
>;

@Injectable()
export class EditProductDetailsUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({
    productId,
    creatorId,
    name,
    description,
  }: EditProductDetailsUseCaseRequest): Promise<EditProductDetailsUseCaseResponse> {
    const product = await this.productsRepository.findById(productId);
    if (!product) {
      return left(new ResourceNotFoundError());
    }

    if (creatorId != product.creatorId.toString()) {
      return left(new NotAllowedError());
    }

    product.updateDetails(
      name ?? product.name,
      description ?? product.description,
    );

    await this.productsRepository.save(product);

    return right({
      product,
    });
  }
}

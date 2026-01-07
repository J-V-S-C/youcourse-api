import { Either, left, right } from 'src/core/either';
import { Product } from '../../enterprise/entities/product';
import { Money } from '../../enterprise/entities/value-objects/money';
import { ProductsRepository } from '../repositories/products-repository';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';

interface EditProductsUseCaseRequest {
  productId: string;
  creatorId: string;
  name?: string;
  description?: string;
  price?: Money;
  available?: boolean;
}

type EditProductUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  { product: Product }
>;

export class EditProductUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({
    productId,
    creatorId,
    name,
    description,
    price,
    available,
  }: EditProductsUseCaseRequest): Promise<EditProductUseCaseResponse> {
    const product = await this.productsRepository.findById(productId);
    if (!product) {
      return left(new ResourceNotFoundError());
    }

    if (creatorId != product.creatorId.toString()) {
      return left(new NotAllowedError());
    }

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.available = available ?? product.available;

    await this.productsRepository.save(product);

    return right({
      product,
    });
  }
}

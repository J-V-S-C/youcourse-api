import { Either, right } from 'src/core/either';
import { Product } from '../../enterprise/entities/product';
import { Money } from '../../enterprise/entities/value-objects/money';
import { ProductsRepository } from '../repositories/products-repository';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';

interface CreateProductsUseCaseRequest {
  creatorId: string;
  name: string;
  description: string;
  price: Money;
  available?: boolean;
}

type CreateProductUseCaseResponse = Either<null, { product: Product }>;

export class CreateProductUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({
    creatorId,
    name,
    description,
    price,
    available,
  }: CreateProductsUseCaseRequest): Promise<CreateProductUseCaseResponse> {
    const product = Product.create({
      creatorId: new UniqueEntityID(creatorId),
      name,
      description,
      price,
      available,
    });
    await this.productsRepository.create(product);

    return right({
      product,
    });
  }
}

import { Either, right } from 'src/core/either';
import { Product } from '../../enterprise/entities/product';
import { Price } from '../../enterprise/entities/value-objects/price';
import { ProductsRepository } from '../repositories/products-repository';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';

interface CreateProductsUseCaseRequest {
  creatorId: string;
  name: string;
  description: string;
  price?: Price;
  visible?: boolean;
  sellable?: boolean;
}

type CreateProductUseCaseResponse = Either<null, { product: Product }>;

export class CreateProductUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({
    creatorId,
    name,
    description,
    price,

    visible,
    sellable,
  }: CreateProductsUseCaseRequest): Promise<CreateProductUseCaseResponse> {
    const product = Product.create({
      creatorId: new UniqueEntityID(creatorId),
      name,
      description,
      price,
      visible,
      sellable,
    });
    await this.productsRepository.create(product);

    return right({
      product,
    });
  }
}

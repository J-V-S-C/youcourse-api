import { Either, left, right } from 'src/core/either';
import { Product } from '../../enterprise/entities/product';
import { ProductsRepository } from '../repositories/products-repository';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { ProductMetrics } from '../../enterprise/entities/value-objects/product-metricts';

interface FetchProductsUseCaseRequest {
  page: number;
  perPage: number;
  orderBy: 'recent' | 'popular' | 'bestSelling';
}

type FetchProductsUseCaseResponse = Either<
  null,
  { visibleProducts: Product[] }
>;

export class FetchProductsUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({
    page,
    perPage,
    orderBy,
  }: FetchProductsUseCaseRequest): Promise<FetchProductsUseCaseResponse> {
    const products = await this.productsRepository.findMany({
      page,
      perPage,
      orderBy,
    });
    const visibleProducts = products.filter((p) => p.visible);

    return right({
      visibleProducts,
    });
  }
}

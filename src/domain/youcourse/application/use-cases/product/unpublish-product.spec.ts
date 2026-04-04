import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository';
import { UnpublishProductUseCase } from './unpublish-product';
import { makeProduct } from 'test/factories/make-product';
import { Price } from '../../enterprise/entities/value-objects/price';

let inMemoryProductsRepository: InMemoryProductsRepository;
let sut: UnpublishProductUseCase;

describe('Unpublish Product', () => {
  beforeEach(() => {
    inMemoryProductsRepository = new InMemoryProductsRepository();
    sut = new UnpublishProductUseCase(inMemoryProductsRepository);
  });

  it('should be able to unpublish a product', async () => {
    const product = makeProduct();
    product.publish();
    inMemoryProductsRepository.items.push(product);

    const result = await sut.execute({
      productId: product.id.toString(),
      creatorId: product.creatorId.toString(),
    });

    expect(result.isRight()).toBeTruthy();

    const savedProduct = inMemoryProductsRepository.items[0];
    expect(savedProduct.sellable).toBeFalsy();
  });

  it('should not be able to unpublish a non existent product', async () => {
    const result = await sut.execute({
      productId: 'fake-id',
      creatorId: 'fake-creator',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to unpublish a product with invalid creator-id', async () => {
    const product = makeProduct();
    inMemoryProductsRepository.items.push(product);

    const result = await sut.execute({
      productId: product.id.toString(),
      creatorId: 'fake-creator',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});

import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository';
import { HideProductUseCase } from './hide-product';
import { makeProduct } from 'test/factories/make-product';

let inMemoryProductsRepository: InMemoryProductsRepository;
let sut: HideProductUseCase;

describe('Hide Product', () => {
  beforeEach(() => {
    inMemoryProductsRepository = new InMemoryProductsRepository();
    sut = new HideProductUseCase(inMemoryProductsRepository);
  });

  it('should be able to hide a product', async () => {
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
    expect(savedProduct.visible).toBeFalsy();
  });

  it('should not be able to hide a non existent product', async () => {
    const result = await sut.execute({
      productId: 'fake-id',
      creatorId: 'fake-creator',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to hide a product with invalid creator-id', async () => {
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

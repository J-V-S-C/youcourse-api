import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository';
import { PublishProductUseCase } from './publish-product';
import { makeProduct } from 'test/factories/make-product';
import { Price } from 'src/domain/youcourse/enterprise/entities/value-objects/price';

let inMemoryProductsRepository: InMemoryProductsRepository;
let sut: PublishProductUseCase;

describe('Publish Product', () => {
  beforeEach(() => {
    inMemoryProductsRepository = new InMemoryProductsRepository();
    sut = new PublishProductUseCase(inMemoryProductsRepository);
  });

  it('should be able to publish a product', async () => {
    const product = makeProduct();
    inMemoryProductsRepository.items.push(product);

    const result = await sut.execute({
      productId: product.id.toString(),
      creatorId: product.creatorId.toString(),
      price: Price.create({
        amount: 10,
        currency: 'USD',
      }),
    });

    expect(result.isRight()).toBeTruthy();

    const savedProduct = inMemoryProductsRepository.items[0];
    expect(savedProduct.price).toEqual(
      expect.objectContaining({
        amount: 10,
        currency: 'USD',
      }),
    );
  });

  it('should not be able to publish a non existent product', async () => {
    const result = await sut.execute({
      productId: 'fake-id',
      creatorId: 'fake-creator',
      price: Price.create({
        amount: 10,
        currency: 'USD',
      }),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to publish a product with invalid creator-id', async () => {
    const product = makeProduct();
    inMemoryProductsRepository.items.push(product);

    const result = await sut.execute({
      productId: product.id.toString(),
      creatorId: 'fake-creator',
      price: Price.create({
        amount: 10,
        currency: 'USD',
      }),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});

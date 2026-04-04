import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository';
import { DeleteProductUseCase } from './delete-product';
import { makeProduct } from 'test/factories/make-product';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

let inMemoryProductsRepository: InMemoryProductsRepository;
let sut: DeleteProductUseCase;

describe('Delete Product', () => {
  beforeEach(() => {
    inMemoryProductsRepository = new InMemoryProductsRepository();
    sut = new DeleteProductUseCase(inMemoryProductsRepository);
  });

  it('should be able to delete a product ', async () => {
    const product = makeProduct();
    inMemoryProductsRepository.items.push(product);

    const result = await sut.execute({
      productId: product.id.toString(),
      creatorId: product.creatorId.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryProductsRepository.items).toHaveLength(0);
  });
  it('should not be able to delete a non existent product', async () => {
    const result = await sut.execute({
      productId: 'fake-id',
      creatorId: 'fake-creator',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to delete a product with invalid owner-id', async () => {
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

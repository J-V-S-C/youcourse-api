import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository';
import { EditProductDetailsUseCase } from './edit-product-details';
import { makeProduct } from 'test/factories/make-product';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';

let inMemoryProductsRepository: InMemoryProductsRepository;
let sut: EditProductDetailsUseCase;

describe('Edit Product Details', () => {
  beforeEach(() => {
    inMemoryProductsRepository = new InMemoryProductsRepository();
    sut = new EditProductDetailsUseCase(inMemoryProductsRepository);
  });

  it('should be able to edit the product details', async () => {
    const product = makeProduct();
    inMemoryProductsRepository.items.push(product);

    const result = await sut.execute({
      productId: product.id.toString(),
      creatorId: product.creatorId.toString(),
      name: 'new name',
      description: 'new description',
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryProductsRepository.items[0]).toMatchObject({
      name: 'new name',
      description: 'new description',
    });
  });
  it('should not be able to edit a non existent product', async () => {
    const result = await sut.execute({
      productId: 'fake-id',
      creatorId: 'fake-creator',
      name: 'new name',
      description: 'new description',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to edit a product with invalid owner-id', async () => {
    const product = makeProduct();
    inMemoryProductsRepository.items.push(product);

    const result = await sut.execute({
      productId: product.id.toString(),
      creatorId: 'fake-creator',
      name: 'new name',
      description: 'new description',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});

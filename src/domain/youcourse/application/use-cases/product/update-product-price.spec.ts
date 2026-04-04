import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository';
import { UpdateProductPriceUseCase } from './update-product-price';
import { makeProduct } from 'test/factories/make-product';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { Price } from 'src/domain/youcourse/enterprise/entities/value-objects/price';

let inMemoryProductsRepository: InMemoryProductsRepository;
let sut: UpdateProductPriceUseCase;

describe('Update Product Price', () => {
  beforeEach(() => {
    inMemoryProductsRepository = new InMemoryProductsRepository();
    sut = new UpdateProductPriceUseCase(inMemoryProductsRepository);
  });

  it('should be able to update the product price', async () => {
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

    const updatedProduct = inMemoryProductsRepository.items[0];
    expect(updatedProduct.price).toMatchObject(
      expect.objectContaining({
        amount: 10,
        currency: 'USD',
      }),
    );
  });
  it('should not be able to update the product price when product does not exist', async () => {
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

  it('should not be able to update a product price with invalid owner-id', async () => {
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

  it('should not be able to update a product price when product is sellable', async () => {
    const product = makeProduct();
    product.publish();
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

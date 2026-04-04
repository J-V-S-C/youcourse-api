import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository';
import { CreateProductUseCase } from './create-product';
import { Price } from 'src/domain/youcourse/enterprise/entities/value-objects/price';

let inMemoryProductsRepository: InMemoryProductsRepository;
let sut: CreateProductUseCase;

describe('Create Product', () => {
  beforeEach(() => {
    inMemoryProductsRepository = new InMemoryProductsRepository();
    sut = new CreateProductUseCase(inMemoryProductsRepository);
  });

  it('should be able to create a new product', async () => {
    const result = await sut.execute({
      creatorId: '1',
      name: 'jerjelim',
      description: '',
      price: Price.create({
        amount: 3,
        currency: 'USD',
      }),
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryProductsRepository.items).toHaveLength(1);
    expect(inMemoryProductsRepository.items[0]).toEqual(result.value?.product);
  });
});

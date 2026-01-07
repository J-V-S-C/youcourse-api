import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository';
import { CreateProductUseCase } from './create-product';
import { Money } from '../../enterprise/entities/value-objects/money';

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
      price: Money.create({
        amount: 3,
        currency: 'USD',
      }),
      available: false,
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryProductsRepository.items).toHaveLength(1);
    expect(inMemoryProductsRepository.items[0]).toEqual(result.value?.product);
  });
});

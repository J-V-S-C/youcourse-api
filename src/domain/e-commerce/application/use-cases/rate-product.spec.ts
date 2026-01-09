import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository';
import { RegisterAccountUseCase } from './register-account';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { AccountAlreadyExistsError } from './errors/account-already-exists-error';
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository';
import { InMemoryRatingsRepository } from 'test/repositories/in-memory-ratings-repository';
import { RateProductUseCase } from './rate-product';

let inMemoryRatingsRepository: InMemoryRatingsRepository;

let sut: RateProductUseCase;

describe('Rate Product', () => {
  beforeEach(() => {
    inMemoryRatingsRepository = new InMemoryRatingsRepository();

    sut = new RateProductUseCase(inMemoryRatingsRepository);
  });

  it('should be able to rate a product', async () => {
    const result = await sut.execute({
      creatorId: '1',
      productId: '1',
      commentary: 'Nice',
      stars: 3.5,
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryRatingsRepository.items).toHaveLength(1);
    expect(inMemoryRatingsRepository.items[0]).toEqual(result.value?.rating);
  });
});

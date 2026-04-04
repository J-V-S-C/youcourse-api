import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository';
import { RegisterAccountUseCase } from './register-account';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { AccountAlreadyExistsError } from './errors/account-already-exists-error';
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { InMemoryRatingsRepository } from 'test/repositories/in-memory-ratings-repository';
import { RateCourseUseCase } from './rate-course';

let inMemoryRatingsRepository: InMemoryRatingsRepository;

let sut: RateCourseUseCase;

describe('Rate Course', () => {
  beforeEach(() => {
    inMemoryRatingsRepository = new InMemoryRatingsRepository();

    sut = new RateCourseUseCase(inMemoryRatingsRepository);
  });

  it('should be able to rate a course', async () => {
    const result = await sut.execute({
      creatorId: '1',
      courseId: '1',
      commentary: 'Nice',
      stars: 3.5,
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryRatingsRepository.items).toHaveLength(1);
    expect(inMemoryRatingsRepository.items[0]).toEqual(result.value?.rating);
  });
});

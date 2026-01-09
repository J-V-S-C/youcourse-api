import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { InMemoryRatingsRepository } from 'test/repositories/in-memory-ratings-repository';
import { EditRatingUseCase } from './edit-rating';
import { makeRating } from 'test/factories/make-rating';

let inMemoryRatingsRepository: InMemoryRatingsRepository;
let sut: EditRatingUseCase;

describe('Edit Rating', () => {
  beforeEach(() => {
    inMemoryRatingsRepository = new InMemoryRatingsRepository();
    sut = new EditRatingUseCase(inMemoryRatingsRepository);
  });

  it('should be able to edit a rating', async () => {
    const rating = makeRating();
    inMemoryRatingsRepository.items.push(rating);

    const result = await sut.execute({
      ratingId: rating.id.toString(),
      creatorId: rating.creatorId.toString(),
      commentary: 'New comment',
      stars: 2.5,
    });

    expect(result.isRight()).toBeTruthy();

    const savedRating = inMemoryRatingsRepository.items[0];
    expect(savedRating.commentary).toEqual('New comment');
    expect(savedRating.stars.value).toEqual(2.5);
  });
  it('should not be able to edit a non existent rating', async () => {
    const result = await sut.execute({
      ratingId: 'fake-id',
      creatorId: 'fake-creator',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to edit a rating with invalid creator-id', async () => {
    const rating = makeRating();
    inMemoryRatingsRepository.items.push(rating);

    const result = await sut.execute({
      ratingId: rating.id.toString(),
      creatorId: 'fake-creator',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});

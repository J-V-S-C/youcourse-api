import { Either, left, right } from 'src/core/either';
import { Rating } from '../../enterprise/entities/rating';
import { RatingsRepository } from '../repositories/ratings-repository';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { Stars } from '../../enterprise/entities/value-objects/stars';

interface EditRatingUseCaseRequest {
  ratingId: string;
  creatorId: string;
  commentary?: string;
  stars?: number;
}

type EditRatingUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  { rating: Rating }
>;

export class EditRatingUseCase {
  constructor(private readonly ratingsRepository: RatingsRepository) {}

  async execute({
    ratingId,
    creatorId,
    commentary,
    stars,
  }: EditRatingUseCaseRequest): Promise<EditRatingUseCaseResponse> {
    const rating = await this.ratingsRepository.findById(ratingId);
    if (!rating) {
      return left(new ResourceNotFoundError());
    }

    if (creatorId != rating.creatorId.toString()) {
      return left(new NotAllowedError());
    }

    if (stars !== undefined) {
      rating.stars = Stars.create(stars);
    }

    if (commentary !== undefined) {
      rating.commentary = commentary;
    }

    await this.ratingsRepository.save(rating);

    return right({
      rating,
    });
  }
}

import { Either, right } from 'src/core/either';
import { Rating } from '../../enterprise/entities/rating';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { RatingsRepository } from '../repositories/ratings-repository';
import { Stars } from '../../enterprise/entities/value-objects/stars';
import { Injectable } from '@nestjs/common';

interface RateProductUseCaseRequest {
  productId: string;
  creatorId: string;
  commentary: string;
  stars: number;
}

type RateProductUseCaseResponse = Either<null, { rating: Rating }>;

@Injectable()
export class RateProductUseCase {
  constructor(private readonly ratingsRepository: RatingsRepository) {}

  async execute({
    productId,
    creatorId,
    commentary,
    stars,
  }: RateProductUseCaseRequest): Promise<RateProductUseCaseResponse> {
    const rating = Rating.create({
      productId: new UniqueEntityID(productId),
      creatorId: new UniqueEntityID(creatorId),
      commentary,
      stars: Stars.create(stars),
    });

    await this.ratingsRepository.create(rating);

    return right({
      rating,
    });
  }
}

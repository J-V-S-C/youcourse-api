import { Either, right } from 'src/core/either';
import { Rating } from 'src/domain/youcourse/enterprise/entities/rating';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { RatingsRepository } from '../../repositories/ratings-repository';
import { Stars } from 'src/domain/youcourse/enterprise/entities/value-objects/stars';
import { Injectable } from '@nestjs/common';

interface RateCourseUseCaseRequest {
  courseId: string;
  creatorId: string;
  commentary?: string;
  stars: number;
}

type RateCourseUseCaseResponse = Either<null, { rating: Rating }>;

@Injectable()
export class RateCourseUseCase {
  constructor(private readonly ratingsRepository: RatingsRepository) { }

  async execute({
    courseId,
    creatorId,
    commentary,
    stars,
  }: RateCourseUseCaseRequest): Promise<RateCourseUseCaseResponse> {
    // #ToDo: se alguma rating existir com o id do criador e do curso passados, deve imprimir erro
    const rating = Rating.create({
      courseId: new UniqueEntityID(courseId),
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

import { Either, left, right } from 'src/core/either';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { Price } from 'src/domain/youcourse/enterprise/entities/value-objects/price';
import { CoursesRepository } from '../../repositories/courses-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { DomainError } from '../errors/domain-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { Injectable } from '@nestjs/common';

interface UpdateCoursePriceUseCaseRequest {
  courseId: string;
  creatorId: string;
  price: Price;
}

type UpdateCoursePriceUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError | DomainError,
  { course: Course }
>;

@Injectable()
export class UpdateCoursePriceUseCase {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  async execute({
    courseId,
    creatorId,
    price,
  }: UpdateCoursePriceUseCaseRequest): Promise<UpdateCoursePriceUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId);
    if (!course) {
      return left(new ResourceNotFoundError());
    }

    if (creatorId != course.creatorId.toString()) {
      return left(new NotAllowedError());
    }

    try {
      course.updatePrice(price);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unexpected error';

      return left(new DomainError(errorMessage));
    }

    await this.coursesRepository.save(course);

    return right({
      course,
    });
  }
}

import { Either, left, right } from 'src/core/either';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { CoursesRepository } from '../../repositories/courses-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { Price } from 'src/domain/youcourse/enterprise/entities/value-objects/price';
import { Injectable } from '@nestjs/common';

interface PublishCourseUseCaseRequest {
  courseId: string;
  creatorId: string;
  price: Price;
}

type PublishCourseUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  { course: Course }
>;
@Injectable()
export class PublishCourseUseCase {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  async execute({
    courseId,
    creatorId,
    price,
  }: PublishCourseUseCaseRequest): Promise<PublishCourseUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId);
    if (!course) {
      return left(new ResourceNotFoundError());
    }

    if (creatorId != course.creatorId.toString()) {
      return left(new NotAllowedError());
    }

    course.updatePrice(price);
    course.publish();

    await this.coursesRepository.save(course);

    return right({
      course,
    });
  }
}

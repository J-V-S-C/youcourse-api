import { Either, left, right } from 'src/core/either';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { Price } from 'src/domain/youcourse/enterprise/entities/value-objects/price';
import { CoursesRepository } from '../../repositories/courses-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { Injectable } from '@nestjs/common';

interface DeleteCourseUseCaseRequest {
  courseId: string;
  creatorId: string;
}

type DeleteCourseUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  object
>;

@Injectable()
export class DeleteCourseUseCase {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  async execute({
    courseId,
    creatorId,
  }: DeleteCourseUseCaseRequest): Promise<DeleteCourseUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId);
    if (!course) {
      return left(new ResourceNotFoundError());
    }

    if (creatorId != course.creatorId.toString()) {
      return left(new NotAllowedError());
    }

    await this.coursesRepository.delete(course);

    return right({});
  }
}

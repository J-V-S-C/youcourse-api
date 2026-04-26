import { Either, left, right } from 'src/core/either';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { CoursesRepository } from '../../repositories/courses-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { Injectable } from '@nestjs/common';

interface UnpublishCourseUseCaseRequest {
  courseId: string;
  creatorId: string;
}

type UnpublishCourseUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  { course: Course }
>;

@Injectable()
export class UnpublishCourseUseCase {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  async execute({
    courseId,
    creatorId,
  }: UnpublishCourseUseCaseRequest): Promise<UnpublishCourseUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId);
    if (!course) {
      return left(new ResourceNotFoundError());
    }

    if (creatorId != course.creatorId.toString()) {
      return left(new NotAllowedError());
    }

    course.unpublish();

    await this.coursesRepository.save(course);

    return right({
      course,
    });
  }
}

import { Either, left, right } from 'src/core/either';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { CoursesRepository } from '../../repositories/courses-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { Injectable } from '@nestjs/common';

interface HideCourseUseCaseRequest {
  courseId: string;
  creatorId: string;
}

type HideCourseUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  { course: Course }
>;

@Injectable()
export class HideCourseUseCase {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  async execute({
    courseId,
    creatorId,
  }: HideCourseUseCaseRequest): Promise<HideCourseUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId);
    if (!course) {
      return left(new ResourceNotFoundError());
    }

    if (creatorId != course.creatorId.toString()) {
      return left(new NotAllowedError());
    }

    course.hide();

    await this.coursesRepository.save(course);

    return right({
      course,
    });
  }
}

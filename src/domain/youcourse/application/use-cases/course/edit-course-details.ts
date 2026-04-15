import { Either, left, right } from 'src/core/either';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { CoursesRepository } from '../../repositories/courses-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { Injectable } from '@nestjs/common';

interface EditCourseDetailsUseCaseRequest {
  courseId: string;
  creatorId: string;
  name?: string;
  description?: string;
}

type EditCourseDetailsUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  { course: Course }
>;

@Injectable()
export class EditCourseDetailsUseCase {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  async execute({
    courseId,
    creatorId,
    name,
    description,
  }: EditCourseDetailsUseCaseRequest): Promise<EditCourseDetailsUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId);
    if (!course) {
      return left(new ResourceNotFoundError());
    }

    if (creatorId != course.creatorId.toString()) {
      return left(new NotAllowedError());
    }

    course.updateDetails(
      name ?? course.name,
      description ?? course.description,
    );

    await this.coursesRepository.save(course);

    return right({
      course,
    });
  }
}

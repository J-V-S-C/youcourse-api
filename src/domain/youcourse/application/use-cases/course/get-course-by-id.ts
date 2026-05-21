import { Either, left, right } from 'src/core/either';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { CoursesRepository } from '../../repositories/courses-repository';
import { EnrollmentsRepository } from '../../repositories/enrollments-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { Injectable } from '@nestjs/common';
import { NotAllowedError } from '../errors/not-allowed-error';

interface GetCourseByIdUseCaseRequest {
  courseId: string;
  userId?: string;
}

type GetCourseByIdUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  { course: Course }
>;

@Injectable()
export class GetCourseByIdUseCase {
  constructor(
    private readonly coursesRepository: CoursesRepository,
    private readonly enrollmentsRepository: EnrollmentsRepository,
  ) {}

  async execute({
    courseId,
    userId,
  }: GetCourseByIdUseCaseRequest): Promise<GetCourseByIdUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId);

    if (!course) {
      return left(new ResourceNotFoundError());
    }

    if (userId) {
      const isCourseOwner = course.creatorId.toString() === userId;

      const isStudentEnrolled =
        await this.enrollmentsRepository.findByStudentIdAndCourseId(
          userId,
          courseId,
        );

      const hasPrivateAccess = isCourseOwner || !!isStudentEnrolled;

      if (!hasPrivateAccess && !course.visible) {
        return left(new ResourceNotFoundError());
      }

      return right({ course });
    }

    if (!course.visible) {
      return left(new ResourceNotFoundError());
    }

    return right({ course });
  }
}

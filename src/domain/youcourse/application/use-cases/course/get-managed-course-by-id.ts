import { Either, left, right } from 'src/core/either';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { CoursesRepository } from '../../repositories/courses-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { Injectable } from '@nestjs/common';
import { NotAllowedError } from '../errors/not-allowed-error';

interface GetManagedCourseByIdUseCaseRequest {
  courseId: string;
  userId: string;
}

type GetManagedCourseByIdUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  { course: Course }
>;

@Injectable()
export class GetManagedCourseByIdUseCase {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  async execute({
    courseId,
    userId,
  }: GetManagedCourseByIdUseCaseRequest): Promise<GetManagedCourseByIdUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId);

    if (!course) {
      return left(new ResourceNotFoundError());
    }

    if (course.creatorId.toString() !== userId) {
      // Se o curso for invisível e o usuário não for o dono, 404 por ofuscação
      if (!course.visible) {
        return left(new ResourceNotFoundError());
      }

      return left(new NotAllowedError());
    }

    return right({ course });
  }
}

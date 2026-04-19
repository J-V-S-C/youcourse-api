import { Either, left, right } from 'src/core/either';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { CoursesRepository } from '../../repositories/courses-repository';
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
  constructor(private readonly coursesRepository: CoursesRepository) {}

  async execute({
    courseId,
    userId,
  }: GetCourseByIdUseCaseRequest): Promise<GetCourseByIdUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId);

    if (!course) return left(new ResourceNotFoundError());

    // Se um usuário foi passado, ele está tentando gerenciar (precisa ser o dono)
    if (userId && course.creatorId.toString() !== userId) {
      return left(new NotAllowedError());
    }

    // Se nenhum usuário foi passado, é uma busca pública (precisa estar visível)
    if (!userId && !course.visible) {
      return left(new ResourceNotFoundError());
    }

    return right({ course });
  }
}

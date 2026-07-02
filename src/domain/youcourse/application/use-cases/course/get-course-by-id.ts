import { Either, left, right } from 'src/core/either';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { CoursesRepository } from '../../repositories/courses-repository';
import { EnrollmentsRepository } from '../../repositories/enrollments-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { Injectable } from '@nestjs/common';

interface GetCourseByIdUseCaseRequest {
  courseId: string;
  userId?: string;
}

type GetCourseByIdUseCaseResponse = Either<
  ResourceNotFoundError,
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

    // Se houver um usuário autenticado (Jornada do Aluno)
    if (userId) {
      const isStudentEnrolled =
        await this.enrollmentsRepository.findByStudentIdAndCourseId(
          userId,
          courseId,
        );

      // Se não for matriculado e o curso estiver oculto, retorna 404 por ofuscação
      if (!isStudentEnrolled && !course.visible) {
        return left(new ResourceNotFoundError());
      }

      return right({ course });
    }

    // Se não houver usuário (Jornada Pública) e o curso estiver oculto -> 404
    if (!course.visible) {
      return left(new ResourceNotFoundError());
    }

    return right({ course });
  }
}

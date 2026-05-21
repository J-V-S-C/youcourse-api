import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { EnrollmentsRepository } from '../../repositories/enrollments-repository';
import { CoursesRepository } from '../../repositories/courses-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { Enrollment } from 'src/domain/youcourse/enterprise/entities/enrollment';

interface VerifyCourseAccessInput {
  courseId: string;
  accountId: string;
}

interface VerifyCourseAccessOutput {
  enrollment: Enrollment;
}

@Injectable()
export class VerifyCourseAccessUseCase {
  constructor(
    private enrollmentsRepository: EnrollmentsRepository,
    private coursesRepository: CoursesRepository,
  ) {}

  async execute(
    input: VerifyCourseAccessInput,
  ): Promise<Either<Error, VerifyCourseAccessOutput>> {
    const { courseId, accountId } = input;

    const course = await this.coursesRepository.findById(courseId);

    if (!course) {
      return left(new ResourceNotFoundError('Course'));
    }

    const enrollment =
      (await this.enrollmentsRepository.findByStudentIdAndCourseId(
        accountId,
        courseId,
      )) as Enrollment | null;

    if (!enrollment) {
      return left(new NotAllowedError());
    }

    return right({ enrollment });
  }
}

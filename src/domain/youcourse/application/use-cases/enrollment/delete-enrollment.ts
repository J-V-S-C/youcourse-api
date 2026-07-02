import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { EnrollmentsRepository } from '../../repositories/enrollments-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

interface DeleteEnrollmentInput {
  courseId: string;
  accountId: string;
}

type DeleteEnrollmentOutput = Either<ResourceNotFoundError, null>;

@Injectable()
export class DeleteEnrollmentUseCase {
  constructor(private enrollmentsRepository: EnrollmentsRepository) {}

  async execute(input: DeleteEnrollmentInput): Promise<DeleteEnrollmentOutput> {
    const { courseId, accountId } = input;

    const enrollment =
      await this.enrollmentsRepository.findByStudentIdAndCourseId(
        accountId,
        courseId,
      );

    if (!enrollment) {
      return left(new ResourceNotFoundError('Enrollment'));
    }

    await this.enrollmentsRepository.delete(enrollment);

    return right(null);
  }
}

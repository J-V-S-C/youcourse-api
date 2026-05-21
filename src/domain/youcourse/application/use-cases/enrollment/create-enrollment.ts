import { Either, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { Enrollment } from 'src/domain/youcourse/enterprise/entities/enrollment';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { EnrollmentsRepository } from '../../repositories/enrollments-repository';

interface CreateEnrollmentUseCaseRequest {
  studentId: string;
  courseId: string;
}

type CreateEnrollmentUseCaseResponse = Either<null, { enrollment: Enrollment }>;

@Injectable()
export class CreateEnrollmentUseCase {
  constructor(private readonly enrollsRepository: EnrollmentsRepository) { }

  async execute({
    studentId,
    courseId,
  }: CreateEnrollmentUseCaseRequest): Promise<CreateEnrollmentUseCaseResponse> {
    const enrollment = Enrollment.create({
      studentId: new UniqueEntityID(studentId),
      courseId: new UniqueEntityID(courseId),
    });
    await this.enrollsRepository.create(enrollment);

    return right({
      enrollment,
    });
  }
}

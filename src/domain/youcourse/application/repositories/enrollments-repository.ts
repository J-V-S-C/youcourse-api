import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Enrollment } from '../../enterprise/entities/enrollment';
import { PaginationParams } from 'src/core/repositories/pagination-params';

export abstract class EnrollmentsRepository {
  abstract create(enrollment: Enrollment): Promise<void>;
  abstract findByStudentIdAndCourseId(
    studentId: string,
    courseId: string,
  ): Promise<Enrollment | null>;
  abstract findManyByStudentId(
    studentId: string,
    params: PaginationParams,
  ): Promise<Enrollment[]>;
  abstract delete(enrollment: Enrollment): Promise<void>;
}

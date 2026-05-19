import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Enrollment } from '../../enterprise/entities/enrollment';
import { PaginationParams } from 'src/core/repositories/pagination-params';

export abstract class EnrollmentsRepository {
  abstract create(enrollment: Enrollment): Promise<void>;
  abstract findManyByCourseId(
    courseId: UniqueEntityID,
    params: PaginationParams,
  ): Promise<Enrollment[]>;
  abstract delete(enrollment: Enrollment): Promise<void>;
}

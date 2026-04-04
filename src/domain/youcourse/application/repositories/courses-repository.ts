import { PaginationParams } from 'src/core/repositories/pagination-params';
import { Course } from '../../enterprise/entities/course';

export abstract class CoursesRepository {
  abstract create(course: Course): Promise<void>;
  abstract save(course: Course): Promise<void>;
  abstract findById(id: string): Promise<Course | null>;
  abstract findMany(params: PaginationParams): Promise<Course[]>;
  abstract delete(course: Course): Promise<void>;
}

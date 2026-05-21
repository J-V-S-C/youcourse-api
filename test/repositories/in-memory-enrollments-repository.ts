import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { PaginationParams } from 'src/core/repositories/pagination-params';
import { EnrollmentsRepository } from 'src/domain/youcourse/application/repositories/enrollments-repository';
import { Enrollment } from 'src/domain/youcourse/enterprise/entities/enrollment';

export class InMemoryEnrollmentsRepository implements EnrollmentsRepository {
  public items: Enrollment[] = [];

  async create(enrollment: Enrollment): Promise<void> {
    this.items.push(enrollment);
  }

  async findByStudentIdAndCourseId(
    studentId: string,
    courseId: string,
  ): Promise<Enrollment | null> {
    const enrollment = this.items.find(
      (item) =>
        item.studentId.toString() === studentId &&
        item.courseId.toString() === courseId,
    );

    if (!enrollment) {
      return null;
    }

    return enrollment;
  }

  async delete(enrollment: Enrollment): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === enrollment.id);
    this.items.splice(itemIndex, 1);
  }
}

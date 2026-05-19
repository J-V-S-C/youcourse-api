import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { PaginationParams } from 'src/core/repositories/pagination-params';
import { EnrollmentsRepository } from 'src/domain/youcourse/application/repositories/enrollments-repository';
import { Enrollment } from 'src/domain/youcourse/enterprise/entities/enrollment';

export class InMemoryEnrollmentsRepository implements EnrollmentsRepository {
  public items: Enrollment[] = [];

  async create(enrollment: Enrollment): Promise<void> {
    this.items.push(enrollment);
  }
  async findManyByCourseId(courseId: UniqueEntityID, { orderBy, page, perPage }: PaginationParams): Promise<Enrollment[]> {
    return this.items
      .filter((enroll) => enroll.courseId.equals(courseId))
      .slice()
      .sort((a, b) => {
        switch (orderBy) {
          case 'recent':
            return b.enrolledAt.getTime() - a.enrolledAt.getTime();
          default:
            return 0
        }
      })
      .slice((page - 1) * perPage, page * perPage);
  }

  async delete(enrollment: Enrollment): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === enrollment.id);
    this.items.splice(itemIndex, 1);
  }
}

import { PaginationParams } from 'src/core/repositories/pagination-params';
import { CoursesRepository } from 'src/domain/youcourse/application/repositories/courses-repository';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { CourseMetrics } from 'src/domain/youcourse/enterprise/entities/course-metrics';

export class InMemoryCoursesRepository implements CoursesRepository {
  public items: Course[] = [];
  metrics: Map<string, CourseMetrics> = new Map();

  async create(course: Course): Promise<void> {
    this.items.push(course);
  }

  async findById(id: string): Promise<Course | null> {
    return this.items.find((course) => course.id.toString() === id) ?? null;
  }

  async findMany({
    page,
    perPage,
    orderBy,
  }: PaginationParams): Promise<Course[]> {
    const courses = this.items
      .sort((a, b) => {
        switch (orderBy) {
          case 'recent':
            return b.createdAt.getTime() - a.createdAt.getTime();
          case 'popular':
            return this.getScore(b) - this.getScore(a);
          case 'bestSelling':
            return this.getSales(b) - this.getSales(a);
          default:
            return 0;
        }
      })
      .slice((page - 1) * perPage, page * perPage);

    return courses;
  }

  async save(course: Course): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === course.id);
    this.items[itemIndex] = course;
  }

  async delete(course: Course): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === course.id);
    this.items.splice(itemIndex, 1);
  }

  private getScore(course: Course): number {
    const metric = this.metrics.get(course.id.toString());
    if (!metric) return 0;
    return metric.sales * 5 + metric.clicks * 2 + metric.views * 0.1;
  }

  private getSales(course: Course): number {
    const metric = this.metrics.get(course.id.toString());
    if (!metric) return 0;
    return metric.sales;
  }
}

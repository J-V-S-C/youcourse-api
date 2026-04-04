import { CoursesRepository } from 'src/domain/ecommerce/application/repositories/courses-repository';
import { Course } from 'src/domain/ecommerce/enterprise/entities/course';
import { PrismaService } from '../prisma.service';
import { PrismaCourseMapper } from '../mappers/prisma-course-mapper';
import { Injectable } from '@nestjs/common';
import { PaginationParams } from 'src/core/repositories/pagination-params';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaCoursesRepository implements CoursesRepository {
  constructor(private prisma: PrismaService) {}

  async create(course: Course): Promise<void> {
    const data = PrismaCourseMapper.toPrisma(course);
    await this.prisma.course.create({
      data,
    });
  }

  async findById(id: string): Promise<Course | null> {
    const course = await this.prisma.course.findUnique({
      where: {
        id,
      },
    });

    if (!course) {
      return null;
    }

    return PrismaCourseMapper.toDomain(course);
  }

  async findMany({
    page,
    perPage,
    orderBy,
  }: PaginationParams): Promise<Course[]> {
    const orderByMap = {
      recent: { createdAt: 'desc' },
      bestSelling: { metrics: { sales: 'desc' } },
      popular: { metrics: { score: 'desc' } },
    } satisfies Record<string, Prisma.CourseOrderByWithRelationInput>;
    const orderByClause = orderByMap[orderBy];
    if (!orderByClause) return [];

    const skip = (page - 1) * perPage;
    const courses = await this.prisma.course.findMany({
      orderBy: orderByClause,
      skip,
      take: perPage,
    });

    return courses.map(PrismaCourseMapper.toDomain);
  }

  async save(course: Course): Promise<void> {}

  async delete(course: Course): Promise<void> {}
}

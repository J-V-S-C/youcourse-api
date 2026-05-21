import { PrismaService } from '../prisma.service';
import { PrismaEnrollmentMapper } from '../mappers/prisma-enrollment-mapper';
import { Injectable } from '@nestjs/common';
import { PaginationParams } from 'src/core/repositories/pagination-params';
import { Prisma } from '@prisma/client';
import { Enrollment } from 'src/domain/youcourse/enterprise/entities/enrollment';
import { EnrollmentsRepository } from 'src/domain/youcourse/application/repositories/enrollments-repository';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';

@Injectable()
export class PrismaEnrollmentsRepository implements EnrollmentsRepository {
  constructor(private prisma: PrismaService) { }

  async create(enrollment: Enrollment): Promise<void> {
    const data = PrismaEnrollmentMapper.toPrisma(enrollment);
    await this.prisma.enrollment.create({
      data,
    });
  }

  async findManyByCourseId(
    courseId: UniqueEntityID,
    {
      page,
      perPage,
      orderBy,
    }: PaginationParams): Promise<Enrollment[]> {

    const orderByMap: Record<string, Prisma.EnrollmentOrderByWithRelationInput> = {
      recent: { enrolledAt: 'desc' },
    };

    const orderByClause = orderByMap[orderBy] ?? { enrolledAt: 'desc' };

    const skip = (page - 1) * perPage;
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        courseId: courseId.toString(),
      },
      orderBy: orderByClause,
      skip,
      take: perPage,
    });

    return enrollments.map((enrollment) => PrismaEnrollmentMapper.toDomain(enrollment));
  }

  async delete(enrollment: Enrollment): Promise<void> {
    await this.prisma.enrollment.delete({
      where: { id: enrollment.id.toString() },
    });
  }
}

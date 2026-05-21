import { PrismaService } from '../prisma.service';
import { PrismaEnrollmentMapper } from '../mappers/prisma-enrollment-mapper';
import { Injectable } from '@nestjs/common';
import { Enrollment } from 'src/domain/youcourse/enterprise/entities/enrollment';
import { EnrollmentsRepository } from 'src/domain/youcourse/application/repositories/enrollments-repository';

@Injectable()
export class PrismaEnrollmentsRepository implements EnrollmentsRepository {
  constructor(private prisma: PrismaService) {}

  async create(enrollment: Enrollment): Promise<void> {
    const data = PrismaEnrollmentMapper.toPrisma(enrollment);
    await this.prisma.enrollment.create({
      data,
    });
  }

  async findByStudentIdAndCourseId(
    studentId: string,
    courseId: string,
  ): Promise<Enrollment | null> {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        studentId,
        courseId,
      },
    });

    if (!enrollment) {
      return null;
    }

    return PrismaEnrollmentMapper.toDomain(enrollment);
  }

  async delete(enrollment: Enrollment): Promise<void> {
    await this.prisma.enrollment.delete({
      where: { id: enrollment.id.toString() },
    });
  }
}

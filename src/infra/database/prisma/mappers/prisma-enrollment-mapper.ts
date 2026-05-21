import { Prisma, Enrollment as PrismaEnrollment } from '@prisma/client';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Enrollment } from 'src/domain/youcourse/enterprise/entities/enrollment';

export class PrismaEnrollmentMapper {
  static toDomain(raw: PrismaEnrollment): Enrollment {
    return Enrollment.create(
      {
        courseId: new UniqueEntityID(raw.courseId),
        studentId: new UniqueEntityID(raw.studentId),
        enrolledAt: raw.enrolledAt
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(enrollment: Enrollment): Prisma.EnrollmentUncheckedCreateInput {
    return {
      id: enrollment.id.toString(),
      courseId: enrollment.courseId.toString(),
      studentId: enrollment.studentId.toString(),
      enrolledAt: enrollment.enrolledAt
    };
  }
}

import { Injectable } from '@nestjs/common';
import {
  Enrollment,
  EnrollmentProps,
} from 'src/domain/youcourse/enterprise/entities/enrollment';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { makeEnrollment } from '../make-enrollment';
import { PrismaEnrollmentMapper } from 'src/infra/database/prisma/mappers/prisma-enrollment-mapper';

@Injectable()
export class EnrollmentFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaEnrollment(
    data: Partial<EnrollmentProps> = {},
  ): Promise<Enrollment> {
    const enrollment = makeEnrollment(data);

    await this.prisma.enrollment.create({
      data: PrismaEnrollmentMapper.toPrisma(enrollment),
    });

    return enrollment;
  }
}

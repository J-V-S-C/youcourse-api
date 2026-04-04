import { Injectable } from '@nestjs/common';
import {
  Course,
  CourseProps,
} from 'src/domain/ecommerce/enterprise/entities/course';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { makeCourse } from '../make-course';
import { PrismaCourseMapper } from 'src/infra/database/prisma/mappers/prisma-course-mapper';

@Injectable()
export class CourseFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaCourse(data: Partial<CourseProps> = {}): Promise<Course> {
    const course = makeCourse(data);

    await this.prisma.course.create({
      data: PrismaCourseMapper.toPrisma(course),
    });

    return course;
  }
}

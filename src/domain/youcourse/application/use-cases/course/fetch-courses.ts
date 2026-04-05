import { Either, left, right } from 'src/core/either';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { CoursesRepository } from '../../repositories/courses-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { CourseMetrics } from 'src/domain/youcourse/enterprise/entities/course-metrics';
import { Injectable } from '@nestjs/common';

interface FetchCoursesUseCaseRequest {
  page: number;
  perPage: number;
  orderBy: 'recent' | 'popular' | 'bestSelling';
}

type FetchCoursesUseCaseResponse = Either<null, { visibleCourses: Course[] }>;

@Injectable()
export class FetchCoursesUseCase {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  async execute({
    page,
    perPage,
    orderBy,
  }: FetchCoursesUseCaseRequest): Promise<FetchCoursesUseCaseResponse> {
    const courses = await this.coursesRepository.findMany({
      page,
      perPage,
      orderBy,
    });
    const visibleCourses = courses.filter((p) => p.visible);

    return right({
      visibleCourses,
    });
  }
}

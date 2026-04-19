import { Either, right } from 'src/core/either';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { CoursesRepository } from '../../repositories/courses-repository';
import { Injectable } from '@nestjs/common';

interface FetchCreatorCoursesUseCaseRequest {
  creatorId: string;
  page: number;
  perPage: number;
  orderBy: 'recent' | 'popular';
}

type FetchCreatorCoursesUseCaseResponse = Either<null, { courses: Course[] }>;

@Injectable()
export class FetchCreatorCoursesUseCase {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  async execute({
    creatorId,
    page,
    perPage,
    orderBy,
  }: FetchCreatorCoursesUseCaseRequest): Promise<FetchCreatorCoursesUseCaseResponse> {
    const allCourses = await this.coursesRepository.findMany({
      page,
      perPage,
      orderBy,
    });

    const creatorCourses = allCourses.filter(
      (course) => course.creatorId.toString() === creatorId,
    );

    return right({
      courses: creatorCourses,
    });
  }
}

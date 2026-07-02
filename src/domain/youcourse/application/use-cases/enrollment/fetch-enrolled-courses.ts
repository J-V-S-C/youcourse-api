import { Either, right } from 'src/core/either';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { CoursesRepository } from '../../repositories/courses-repository';
import { EnrollmentsRepository } from '../../repositories/enrollments-repository';
import { Injectable } from '@nestjs/common';

interface FetchEnrolledCoursesUseCaseRequest {
  studentId: string;
  page: number;
  perPage: number;
}

type FetchEnrolledCoursesUseCaseResponse = Either<null, { courses: Course[] }>;

@Injectable()
export class FetchEnrolledCoursesUseCase {
  constructor(
    private readonly enrollmentsRepository: EnrollmentsRepository,
    private readonly coursesRepository: CoursesRepository,
  ) { }

  async execute({
    studentId,
    page,
    perPage,
  }: FetchEnrolledCoursesUseCaseRequest): Promise<FetchEnrolledCoursesUseCaseResponse> {
    const enrollments = await this.enrollmentsRepository.findManyByStudentId(
      studentId,
      { page, perPage, orderBy: 'recent' },
    );

    const coursesPromises = enrollments.map((enrollment) =>
      this.coursesRepository.findById(enrollment.courseId.toString()),
    );

    const courses = (await Promise.all(coursesPromises)).filter(
      (course): course is Course => course !== null,
    );

    return right({
      courses,
    });
  }
}

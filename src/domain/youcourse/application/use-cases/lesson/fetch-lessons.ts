import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { LessonsRepository } from '../../repositories/lessons-repository';
import { UnitsRepository } from '../../repositories/units-repository';
import { CoursesRepository } from '../../repositories/courses-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { Lesson } from 'src/domain/youcourse/enterprise/entities/lesson';

interface FetchLessonsInput {
  unitId: string;
  accountId?: string;
}

interface FetchLessonsOutput {
  lessons: Lesson[];
}

@Injectable()
export class FetchLessonsUseCase {
  constructor(
    private lessonsRepository: LessonsRepository,
    private unitsRepository: UnitsRepository,
    private coursesRepository: CoursesRepository,
  ) {}

  async execute(
    input: FetchLessonsInput,
  ): Promise<Either<Error, FetchLessonsOutput>> {
    const unit = await this.unitsRepository.findById(input.unitId);

    if (!unit) {
      return left(new ResourceNotFoundError('Unit'));
    }

    const course = await this.coursesRepository.findById(
      unit.courseId.toString(),
    );

    if (!course) {
      return left(new ResourceNotFoundError('Course'));
    }

    const lessons = await this.lessonsRepository.findManyByUnitId(input.unitId);

    const sortedLessons = [...lessons].sort((a, b) => a.position - b.position);

    const hasFullAccess = input.accountId === course.creatorId.toString();

    if (!hasFullAccess) {
      for (const lesson of sortedLessons) {
        if (!lesson.isPreview) {
          lesson.removeVideo();
        }
      }
    }

    return right({ lessons: sortedLessons });
  }
}

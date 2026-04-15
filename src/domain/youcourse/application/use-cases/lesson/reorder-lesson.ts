import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { LessonsRepository } from '../../repositories/lessons-repository';
import { UnitsRepository } from '../../repositories/units-repository';
import { CoursesRepository } from '../../repositories/courses-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

interface ReorderLessonInput {
  creatorId: string;
  lessonId: string;
  position: number;
}

interface ReorderLessonOutput {
  lessonId: string;
}

@Injectable()
export class ReorderLessonUseCase {
  constructor(
    private lessonsRepository: LessonsRepository,
    private unitsRepository: UnitsRepository,
    private coursesRepository: CoursesRepository,
  ) {}

  async execute(
    input: ReorderLessonInput,
  ): Promise<Either<Error, ReorderLessonOutput>> {
    const lesson = await this.lessonsRepository.findById(input.lessonId);

    if (!lesson) {
      return left(new ResourceNotFoundError('Lesson'));
    }

    const unit = await this.unitsRepository.findById(lesson.unitId.toString());

    if (!unit) {
      return left(new ResourceNotFoundError('Unit'));
    }

    const course = await this.coursesRepository.findById(
      unit.courseId.toString(),
    );

    if (!course) {
      return left(new ResourceNotFoundError('Course'));
    }

    if (course.creatorId.toString() !== input.creatorId) {
      return left(new NotAllowedError());
    }

    lesson.reorder(input.position);

    await this.lessonsRepository.save(lesson);

    return right({ lessonId: lesson.id.toString() });
  }
}

import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { Lesson } from 'src/domain/youcourse/enterprise/entities/lesson';
import { LessonsRepository } from '../../repositories/lessons-repository';
import { UnitsRepository } from '../../repositories/units-repository';
import { CoursesRepository } from '../../repositories/courses-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

interface EditLessonDetailsInput {
  creatorId: string;
  lessonId: string;
  name?: string;
  description?: string;
  isPreview?: boolean;
}

interface EditLessonDetailsOutput {
  lessonId: string;
}

@Injectable()
export class EditLessonDetailsUseCase {
  constructor(
    private lessonsRepository: LessonsRepository,
    private unitsRepository: UnitsRepository,
    private coursesRepository: CoursesRepository,
  ) {}

  async execute(
    input: EditLessonDetailsInput,
  ): Promise<Either<Error, EditLessonDetailsOutput>> {
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

    if (input.name !== undefined) {
      lesson.updateDetails(input.name, input.description);
    }

    if (input.isPreview !== undefined) {
      lesson.setPreview(input.isPreview);
    }

    await this.lessonsRepository.save(lesson);

    return right({ lessonId: lesson.id.toString() });
  }
}

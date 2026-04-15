import { Either, left, right } from 'src/core/either';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Injectable } from '@nestjs/common';
import { Lesson } from 'src/domain/youcourse/enterprise/entities/lesson';
import { LessonsRepository } from '../../repositories/lessons-repository';
import { UnitsRepository } from '../../repositories/units-repository';
import { CoursesRepository } from '../../repositories/courses-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

interface CreateLessonInput {
  creatorId: string;
  unitId: string;
  name: string;
  description?: string;
  position?: number;
  isPreview?: boolean;
}

interface CreateLessonOutput {
  lesson: Lesson;
}

@Injectable()
export class CreateLessonUseCase {
  constructor(
    private lessonsRepository: LessonsRepository,
    private unitsRepository: UnitsRepository,
    private coursesRepository: CoursesRepository,
  ) {}

  async execute(
    input: CreateLessonInput,
  ): Promise<Either<Error, CreateLessonOutput>> {
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

    if (course.creatorId.toString() !== input.creatorId) {
      return left(new NotAllowedError());
    }

    const lessonsCount = await this.lessonsRepository.countByUnitId(
      input.unitId,
    );
    const position = input.position ?? lessonsCount;

    const lesson = Lesson.createPending({
      unitId: new UniqueEntityID(input.unitId),
      name: input.name,
      description: input.description,
      position,
      isPreview: input.isPreview,
    });

    await this.lessonsRepository.create(lesson);

    return right({ lesson });
  }
}

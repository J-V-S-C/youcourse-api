import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { Unit } from 'src/domain/youcourse/enterprise/entities/unit';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { UnitsRepository } from '../../repositories/units-repository';
import { CoursesRepository } from '../../repositories/courses-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

interface CreateUnitInput {
  creatorId: string;
  courseId: string;
  name: string;
  description?: string;
  position?: number;
}

interface CreateUnitOutput {
  unit: Unit;
}

@Injectable()
export class CreateUnitUseCase {
  constructor(
    private unitsRepository: UnitsRepository,
    private coursesRepository: CoursesRepository,
  ) {}

  async execute(
    input: CreateUnitInput,
  ): Promise<Either<Error, CreateUnitOutput>> {
    const course = await this.coursesRepository.findById(input.courseId);

    if (!course) {
      return left(new ResourceNotFoundError('Course'));
    }

    if (course.creatorId.toString() !== input.creatorId) {
      return left(new NotAllowedError());
    }

    const existingUnits = await this.unitsRepository.findByCourseId(
      input.courseId,
    );
    const position = input.position ?? existingUnits.length;

    const unit = Unit.create({
      courseId: new UniqueEntityID(input.courseId),
      name: input.name,
      description: input.description,
      position,
    });

    await this.unitsRepository.create(unit);

    return right({ unit });
  }
}

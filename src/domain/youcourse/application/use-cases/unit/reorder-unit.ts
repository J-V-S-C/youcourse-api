import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { UnitsRepository } from '../../repositories/units-repository';
import { CoursesRepository } from '../../repositories/courses-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

interface ReorderUnitInput {
  creatorId: string;
  unitId: string;
  position: number;
}

interface ReorderUnitOutput {
  unitId: string;
}

@Injectable()
export class ReorderUnitUseCase {
  constructor(
    private unitsRepository: UnitsRepository,
    private coursesRepository: CoursesRepository,
  ) {}

  async execute(
    input: ReorderUnitInput,
  ): Promise<Either<Error, ReorderUnitOutput>> {
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

    unit.reorder(input.position);

    await this.unitsRepository.save(unit);

    return right({ unitId: unit.id.toString() });
  }
}

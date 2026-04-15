import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { UnitsRepository } from '../../repositories/units-repository';
import { CoursesRepository } from '../../repositories/courses-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

interface EditUnitDetailsInput {
  creatorId: string;
  unitId: string;
  name?: string;
  description?: string;
}

interface EditUnitDetailsOutput {
  unitId: string;
}

@Injectable()
export class EditUnitDetailsUseCase {
  constructor(
    private unitsRepository: UnitsRepository,
    private coursesRepository: CoursesRepository,
  ) {}

  async execute(
    input: EditUnitDetailsInput,
  ): Promise<Either<Error, EditUnitDetailsOutput>> {
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

    if (input.name !== undefined) {
      unit.updateDetails(input.name, input.description);
    }

    await this.unitsRepository.save(unit);

    return right({ unitId: unit.id.toString() });
  }
}

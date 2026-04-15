import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { UnitsRepository } from '../../repositories/units-repository';
import { CoursesRepository } from '../../repositories/courses-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

interface DeleteUnitInput {
  creatorId: string;
  unitId: string;
}

type DeleteUnitOutput = void;

@Injectable()
export class DeleteUnitUseCase {
  constructor(
    private unitsRepository: UnitsRepository,
    private coursesRepository: CoursesRepository,
  ) {}

  async execute(
    input: DeleteUnitInput,
  ): Promise<Either<Error, DeleteUnitOutput>> {
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

    await this.unitsRepository.delete(unit);

    return right(undefined);
  }
}

import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { Unit } from 'src/domain/youcourse/enterprise/entities/unit';
import { UnitsRepository } from '../../repositories/units-repository';
import { CoursesRepository } from '../../repositories/courses-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

interface FetchUnitsInput {
  courseId: string;
}

interface FetchUnitsOutput {
  units: Unit[];
}

@Injectable()
export class FetchUnitsUseCase {
  constructor(
    private unitsRepository: UnitsRepository,
    private coursesRepository: CoursesRepository,
  ) {}

  async execute(
    input: FetchUnitsInput,
  ): Promise<Either<Error, FetchUnitsOutput>> {
    const course = await this.coursesRepository.findById(input.courseId);

    if (!course) {
      return left(new ResourceNotFoundError('Course'));
    }

    const units = await this.unitsRepository.findByCourseId(input.courseId);

    const sortedUnits = [...units].sort((a, b) => a.position - b.position);

    return right({ units: sortedUnits });
  }
}

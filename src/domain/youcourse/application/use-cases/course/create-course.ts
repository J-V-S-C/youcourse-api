import { Either, right } from 'src/core/either';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { Price } from 'src/domain/youcourse/enterprise/entities/value-objects/price';
import { CoursesRepository } from '../../repositories/courses-repository';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Injectable } from '@nestjs/common';
import type { Unit } from 'src/domain/youcourse/enterprise/entities/unit';

interface CreateCoursesUseCaseRequest {
  creatorId: string;
  name: string;
  description: string;
  price?: Price;
  visible?: boolean;
  sellable?: boolean;
  units?: Unit[]
}

type CreateCourseUseCaseResponse = Either<null, { course: Course }>;

@Injectable()
export class CreateCourseUseCase {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  async execute({
    creatorId,
    name,
    description,
    price,
    visible,
    sellable,
    units,
  }: CreateCoursesUseCaseRequest): Promise<CreateCourseUseCaseResponse> {
    const course = Course.create({
      creatorId: new UniqueEntityID(creatorId),
      name,
      description,
      price,
      visible,
      sellable,
      units
    });
    await this.coursesRepository.create(course);

    return right({
      course,
    });
  }
}

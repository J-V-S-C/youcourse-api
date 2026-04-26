import { InMemoryUnitsRepository } from 'test/repositories/in-memory-units-repository';
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { FetchUnitsUseCase } from './fetch-units';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { Unit } from 'src/domain/youcourse/enterprise/entities/unit';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

let inMemoryUnitsRepository: InMemoryUnitsRepository;
let inMemoryCoursesRepository: InMemoryCoursesRepository;
let sut: FetchUnitsUseCase;

describe('Fetch Units', () => {
  let courseId: UniqueEntityID;
  let creatorId: UniqueEntityID;

  beforeEach(() => {
    inMemoryUnitsRepository = new InMemoryUnitsRepository();
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    sut = new FetchUnitsUseCase(
      inMemoryUnitsRepository,
      inMemoryCoursesRepository,
    );

    creatorId = new UniqueEntityID();
    courseId = new UniqueEntityID();

    const course = Course.create(
      {
        creatorId,
        name: 'Test Course',
        description: 'Test description',
      },
      courseId,
    );

    inMemoryCoursesRepository.create(course);
  });

  it('should return empty array when course has no units', async () => {
    const result = await sut.execute({
      courseId: courseId.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.units).toHaveLength(0);
    }
  });

  it('should return all units for a course', async () => {
    const unit1Id = new UniqueEntityID();
    const unit2Id = new UniqueEntityID();
    const unit3Id = new UniqueEntityID();

    const unit1 = Unit.create(
      {
        courseId,
        name: 'Unit 1',
        position: 2,
      },
      unit1Id,
    );

    const unit2 = Unit.create(
      {
        courseId,
        name: 'Unit 2',
        position: 0,
      },
      unit2Id,
    );

    const unit3 = Unit.create(
      {
        courseId,
        name: 'Unit 3',
        position: 1,
      },
      unit3Id,
    );

    await inMemoryUnitsRepository.create(unit1);
    await inMemoryUnitsRepository.create(unit2);
    await inMemoryUnitsRepository.create(unit3);

    const result = await sut.execute({
      courseId: courseId.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.units).toHaveLength(3);
      expect(result.value.units[0].name).toBe('Unit 2');
      expect(result.value.units[1].name).toBe('Unit 3');
      expect(result.value.units[2].name).toBe('Unit 1');
    }
  });

  it('should not return units from other courses', async () => {
    const otherCourseId = new UniqueEntityID();
    const otherCourse = Course.create(
      {
        creatorId,
        name: 'Other Course',
        description: 'Other description',
      },
      otherCourseId,
    );

    inMemoryCoursesRepository.create(otherCourse);

    const courseUnit = Unit.create(
      {
        courseId,
        name: 'Course Unit',
      },
      new UniqueEntityID(),
    );

    const otherUnit = Unit.create(
      {
        courseId: otherCourseId,
        name: 'Other Course Unit',
      },
      new UniqueEntityID(),
    );

    await inMemoryUnitsRepository.create(courseUnit);
    await inMemoryUnitsRepository.create(otherUnit);

    const result = await sut.execute({
      courseId: courseId.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.units).toHaveLength(1);
      expect(result.value.units[0].name).toBe('Course Unit');
    }
  });

  it('should return error for non-existent course', async () => {
    const result = await sut.execute({
      courseId: 'non-existent-id',
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    }
  });
});

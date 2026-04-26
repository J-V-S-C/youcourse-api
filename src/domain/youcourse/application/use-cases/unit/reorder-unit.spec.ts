import { InMemoryUnitsRepository } from 'test/repositories/in-memory-units-repository';
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { ReorderUnitUseCase } from './reorder-unit';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { Unit } from 'src/domain/youcourse/enterprise/entities/unit';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

let inMemoryUnitsRepository: InMemoryUnitsRepository;
let inMemoryCoursesRepository: InMemoryCoursesRepository;
let sut: ReorderUnitUseCase;

describe('Reorder Unit', () => {
  let courseId: UniqueEntityID;
  let unitId: UniqueEntityID;
  let creatorId: UniqueEntityID;

  beforeEach(() => {
    inMemoryUnitsRepository = new InMemoryUnitsRepository();
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    sut = new ReorderUnitUseCase(
      inMemoryUnitsRepository,
      inMemoryCoursesRepository,
    );

    creatorId = new UniqueEntityID();
    courseId = new UniqueEntityID();
    unitId = new UniqueEntityID();

    const course = Course.create(
      {
        creatorId,
        name: 'Test Course',
        description: 'Test description',
      },
      courseId,
    );

    inMemoryCoursesRepository.create(course);

    const unit = Unit.create(
      {
        courseId,
        name: 'Test Unit',
        position: 0,
      },
      unitId,
    );

    inMemoryUnitsRepository.create(unit);
  });

  it('should be able to reorder a unit', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      unitId: unitId.toString(),
      position: 5,
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      const updatedUnit = await inMemoryUnitsRepository.findById(
        unitId.toString(),
      );
      expect(updatedUnit?.position).toBe(5);
    }
  });

  it('should not allow reordering non-existent unit', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      unitId: 'non-existent-id',
      position: 5,
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    }
  });

  it('should not allow reordering if user is not the course creator', async () => {
    const differentUserId = new UniqueEntityID();

    const result = await sut.execute({
      creatorId: differentUserId.toString(),
      unitId: unitId.toString(),
      position: 5,
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
    }
  });
});

import { InMemoryUnitsRepository } from 'test/repositories/in-memory-units-repository';
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { DeleteUnitUseCase } from './delete-unit';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { Unit } from 'src/domain/youcourse/enterprise/entities/unit';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

let inMemoryUnitsRepository: InMemoryUnitsRepository;
let inMemoryCoursesRepository: InMemoryCoursesRepository;
let sut: DeleteUnitUseCase;

describe('Delete Unit', () => {
  let courseId: UniqueEntityID;
  let unitId: UniqueEntityID;
  let creatorId: UniqueEntityID;

  beforeEach(() => {
    inMemoryUnitsRepository = new InMemoryUnitsRepository();
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    sut = new DeleteUnitUseCase(
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
        description: 'Test description',
      },
      unitId,
    );

    inMemoryUnitsRepository.create(unit);
  });

  it('should be able to delete a unit', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      unitId: unitId.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryUnitsRepository.items).toHaveLength(0);
  });

  it('should not allow deleting non-existent unit', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      unitId: 'non-existent-id',
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    }
  });

  it('should not allow deleting if user is not the course creator', async () => {
    const differentUserId = new UniqueEntityID();

    const result = await sut.execute({
      creatorId: differentUserId.toString(),
      unitId: unitId.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
    }
  });

  it('should not delete the course, only the unit', async () => {
    await sut.execute({
      creatorId: creatorId.toString(),
      unitId: unitId.toString(),
    });

    expect(inMemoryUnitsRepository.items).toHaveLength(0);
    expect(inMemoryCoursesRepository.items).toHaveLength(1);
  });
});

import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { CreateCourseUseCase } from './create-course';
import { Price } from 'src/domain/youcourse/enterprise/entities/value-objects/price';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';

let inMemoryCoursesRepository: InMemoryCoursesRepository;
let sut: CreateCourseUseCase;

describe('Create Course', () => {
  beforeEach(() => {
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    sut = new CreateCourseUseCase(inMemoryCoursesRepository);
  });

  it('should be able to create a new course', async () => {
    const result = await sut.execute({
      creatorId: '1',
      name: 'jerjelim',
      description: '',
      price: Price.create({
        amount: 300,
        currency: 'USD',
      }),
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryCoursesRepository.items).toHaveLength(1);
    expect(inMemoryCoursesRepository.items[0]).toEqual(result.value?.course);
  });

  it('should not be able to create a sellable course without a price', async () => {
    expect(() => {
      Course.create({
        creatorId: new UniqueEntityID('1'),
        name: 'Expensive Course',
        description: 'Should fail',
        sellable: true,
      });
    }).toThrow('Sellable course must have price');
  });

  it('should be able to create a visible but not sellable course', async () => {
    const result = await sut.execute({
      creatorId: '1',
      name: 'Open Source Course',
      description: 'Free for everyone',
      visible: true,
      sellable: false,
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.course.price).toBeUndefined();
      expect(result.value.course.visible).toBe(true);
      expect(result.value.course.sellable).toBe(false);
    }
  });
});

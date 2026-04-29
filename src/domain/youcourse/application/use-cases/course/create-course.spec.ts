import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { CreateCourseUseCase } from './create-course';
import { Price } from 'src/domain/youcourse/enterprise/entities/value-objects/price';

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
});

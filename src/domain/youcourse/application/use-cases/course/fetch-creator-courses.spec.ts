import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { FetchCreatorCoursesUseCase } from './fetch-creator-courses';
import { makeCourse } from 'test/factories/make-course';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';

let inMemoryCoursesRepository: InMemoryCoursesRepository;
let sut: FetchCreatorCoursesUseCase;

describe('Fetch Creator Courses Use Case', () => {
  beforeEach(() => {
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    sut = new FetchCreatorCoursesUseCase(inMemoryCoursesRepository);
  });

  it('should be able to fetch creator courses (even if invisible)', async () => {
    const creatorId = new UniqueEntityID('creator-01');

    // Curso Visível do Criador
    await inMemoryCoursesRepository.create(
      makeCourse({ creatorId, visible: true }),
    );

    // Curso Oculto do Criador
    await inMemoryCoursesRepository.create(
      makeCourse({ creatorId, visible: false }),
    );

    // Curso de Outro Criador
    await inMemoryCoursesRepository.create(
      makeCourse({ creatorId: new UniqueEntityID('creator-02') }),
    );

    const result = await sut.execute({
      creatorId: 'creator-01',
      page: 1,
      perPage: 10,
      orderBy: 'recent',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value?.courses).toHaveLength(2);
  });
});

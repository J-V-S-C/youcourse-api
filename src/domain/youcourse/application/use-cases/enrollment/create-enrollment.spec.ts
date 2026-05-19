import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { InMemoryEnrollmentsRepository } from 'test/repositories/in-memory-enrollments-repository';
import { CreateEnrollmentmentUseCase } from './create-enrollment';

let inMemoryEnrollmentsRepository: InMemoryEnrollmentsRepository;
let sut: CreateEnrollmentmentUseCase;

describe('Create Enrollment', () => {
  beforeEach(() => {
    inMemoryEnrollmentsRepository = new InMemoryEnrollmentsRepository();
    sut = new CreateEnrollmentmentUseCase(inMemoryEnrollmentsRepository);
  });

  it('should be able to create a new enrollment', async () => {
    const studentId = new UniqueEntityID();
    const courseId = new UniqueEntityID();

    const result = await sut.execute({
      studentId: studentId.toString(),
      courseId: courseId.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryEnrollmentsRepository.items).toHaveLength(1);
      expect(inMemoryEnrollmentsRepository.items[0].id).toBeDefined();
      expect(inMemoryEnrollmentsRepository.items[0].studentId.equals(studentId)).toBeTruthy();
      expect(inMemoryEnrollmentsRepository.items[0].courseId.equals(courseId)).toBeTruthy();
      expect(inMemoryEnrollmentsRepository.items[0].enrolledAt).toBeInstanceOf(Date);
    }
  });

  it('should generate a unique ID for each new enrollment', async () => {
    const studentId = new UniqueEntityID().toString();
    const courseId = new UniqueEntityID().toString();

    const result1 = await sut.execute({ studentId, courseId });
    const result2 = await sut.execute({ studentId, courseId });

    expect(result1.isRight()).toBeTruthy();
    expect(result2.isRight()).toBeTruthy();

    if (result1.isRight() && result2.isRight()) {
      expect(result1.value.enrollment.id.equals(result2.value.enrollment.id)).toBeFalsy();
    }
  });
});

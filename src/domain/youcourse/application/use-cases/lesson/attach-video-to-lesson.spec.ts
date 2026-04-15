import { InMemoryLessonsRepository } from 'test/repositories/in-memory-lessons-repository';
import { InMemoryUnitsRepository } from 'test/repositories/in-memory-units-repository';
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { InMemoryVideoService } from 'test/services/in-memory-video-service';
import { AttachVideoToLessonUseCase } from './attach-video-to-lesson';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { Unit } from 'src/domain/youcourse/enterprise/entities/unit';
import { Lesson } from 'src/domain/youcourse/enterprise/entities/lesson';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

let inMemoryLessonsRepository: InMemoryLessonsRepository;
let inMemoryUnitsRepository: InMemoryUnitsRepository;
let inMemoryCoursesRepository: InMemoryCoursesRepository;
let inMemoryVideoService: InMemoryVideoService;
let sut: AttachVideoToLessonUseCase;

describe('Attach Video to Lesson', () => {
  let courseId: UniqueEntityID;
  let unitId: UniqueEntityID;
  let lessonId: UniqueEntityID;
  let creatorId: UniqueEntityID;

  beforeEach(() => {
    inMemoryLessonsRepository = new InMemoryLessonsRepository();
    inMemoryUnitsRepository = new InMemoryUnitsRepository();
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    inMemoryVideoService = new InMemoryVideoService();
    sut = new AttachVideoToLessonUseCase(
      inMemoryLessonsRepository,
      inMemoryUnitsRepository,
      inMemoryCoursesRepository,
      inMemoryVideoService,
    );

    creatorId = new UniqueEntityID();
    courseId = new UniqueEntityID();
    unitId = new UniqueEntityID();
    lessonId = new UniqueEntityID();

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
      },
      unitId,
    );

    inMemoryUnitsRepository.create(unit);

    const lesson = Lesson.createPending(
      {
        unitId,
        name: 'Test Lesson',
      },
      lessonId,
    );

    inMemoryLessonsRepository.create(lesson);
  });

  it('should be able to attach a video to a lesson', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      lessonId: lessonId.toString(),
      filename: 'lesson-video.mp4',
      contentType: 'video/mp4',
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.video.externalId).toBeDefined();
      expect(result.value.video.uploadUrl).toBeDefined();

      const updatedLesson = await inMemoryLessonsRepository.findById(
        lessonId.toString(),
      );
      expect(updatedLesson?.video).not.toBeNull();
      expect(updatedLesson?.hasVideo).toBe(false);
    }
  });

  it('should not allow attaching video to non-existent lesson', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      lessonId: 'non-existent-id',
      filename: 'lesson-video.mp4',
      contentType: 'video/mp4',
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    }
  });

  it('should not allow attaching video if user is not the course creator', async () => {
    const differentUserId = new UniqueEntityID();

    const result = await sut.execute({
      creatorId: differentUserId.toString(),
      lessonId: lessonId.toString(),
      filename: 'lesson-video.mp4',
      contentType: 'video/mp4',
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
    }
  });
});

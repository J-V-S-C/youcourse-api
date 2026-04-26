import { InMemoryLessonsRepository } from 'test/repositories/in-memory-lessons-repository';
import { InMemoryUnitsRepository } from 'test/repositories/in-memory-units-repository';
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { InMemoryVideoService } from 'test/services/in-memory-video-service';
import { RemoveVideoFromLessonUseCase } from './remove-video-from-lesson';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { Unit } from 'src/domain/youcourse/enterprise/entities/unit';
import { Lesson } from 'src/domain/youcourse/enterprise/entities/lesson';
import { Video } from 'src/domain/youcourse/enterprise/entities/value-objects/video.vo';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

let inMemoryLessonsRepository: InMemoryLessonsRepository;
let inMemoryUnitsRepository: InMemoryUnitsRepository;
let inMemoryCoursesRepository: InMemoryCoursesRepository;
let inMemoryVideoService: InMemoryVideoService;
let sut: RemoveVideoFromLessonUseCase;

describe('Remove Video from Lesson', () => {
  let courseId: UniqueEntityID;
  let unitId: UniqueEntityID;
  let lessonId: UniqueEntityID;
  let creatorId: UniqueEntityID;

  beforeEach(() => {
    inMemoryLessonsRepository = new InMemoryLessonsRepository();
    inMemoryUnitsRepository = new InMemoryUnitsRepository();
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    inMemoryVideoService = new InMemoryVideoService();
    sut = new RemoveVideoFromLessonUseCase(
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
  });

  it('should be able to remove video from a lesson', async () => {
    const video = Video.createReady({
      externalId: 'video-123',
      playbackUrl: 'https://cdn.example.com/video.m3u8',
    });

    const lesson = Lesson.createWithVideo(
      {
        unitId,
        name: 'Test Lesson',
        video,
      },
      lessonId,
    );

    inMemoryLessonsRepository.create(lesson);

    const result = await sut.execute({
      creatorId: creatorId.toString(),
      lessonId: lessonId.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      const updatedLesson = await inMemoryLessonsRepository.findById(
        lessonId.toString(),
      );
      expect(updatedLesson?.video).toBeNull();
      expect(updatedLesson?.hasVideo).toBe(false);
    }
  });

  it('should succeed even if lesson has no video', async () => {
    const lesson = Lesson.createPending(
      {
        unitId,
        name: 'Test Lesson',
      },
      lessonId,
    );

    inMemoryLessonsRepository.create(lesson);

    const result = await sut.execute({
      creatorId: creatorId.toString(),
      lessonId: lessonId.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      const updatedLesson = await inMemoryLessonsRepository.findById(
        lessonId.toString(),
      );
      expect(updatedLesson?.video).toBeNull();
    }
  });

  it('should not allow removing video from non-existent lesson', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      lessonId: 'non-existent-id',
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    }
  });

  it('should not allow removing video if user is not the course creator', async () => {
    const differentUserId = new UniqueEntityID();

    const video = Video.createReady({
      externalId: 'video-123',
      playbackUrl: 'https://cdn.example.com/video.m3u8',
    });

    const lesson = Lesson.createWithVideo(
      {
        unitId,
        name: 'Test Lesson',
        video,
      },
      lessonId,
    );

    inMemoryLessonsRepository.create(lesson);

    const result = await sut.execute({
      creatorId: differentUserId.toString(),
      lessonId: lessonId.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
    }
  });
});

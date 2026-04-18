import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { LessonsRepository } from '../../repositories/lessons-repository';
import { UnitsRepository } from '../../repositories/units-repository';
import { CoursesRepository } from '../../repositories/courses-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { VideoService } from '../../services/video-service';

interface DeleteLessonInput {
  creatorId: string;
  lessonId: string;
}

type DeleteLessonOutput = void;

@Injectable()
export class DeleteLessonUseCase {
  constructor(
    private lessonsRepository: LessonsRepository,
    private unitsRepository: UnitsRepository,
    private coursesRepository: CoursesRepository,
    private videoService: VideoService,
  ) {}

  async execute(
    input: DeleteLessonInput,
  ): Promise<Either<Error, DeleteLessonOutput>> {
    const lesson = await this.lessonsRepository.findById(input.lessonId);

    if (!lesson) {
      return left(new ResourceNotFoundError('Lesson'));
    }

    const unit = await this.unitsRepository.findById(lesson.unitId.toString());

    if (!unit) {
      return left(new ResourceNotFoundError('Unit'));
    }

    const course = await this.coursesRepository.findById(
      unit.courseId.toString(),
    );

    if (!course) {
      return left(new ResourceNotFoundError('Course'));
    }

    if (course.creatorId.toString() !== input.creatorId) {
      return left(new NotAllowedError());
    }

    if (lesson.video) {
      await this.videoService.deleteVideo(lesson.video.externalId);
    }

    await this.lessonsRepository.delete(lesson);

    return right(undefined);
  }
}

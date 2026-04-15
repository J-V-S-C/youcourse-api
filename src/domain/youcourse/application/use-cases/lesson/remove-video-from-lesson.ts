import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { LessonsRepository } from '../../repositories/lessons-repository';
import { UnitsRepository } from '../../repositories/units-repository';
import { CoursesRepository } from '../../repositories/courses-repository';
import type { IVideoService } from '../../services/video-service.interface';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

interface RemoveVideoFromLessonInput {
  creatorId: string;
  lessonId: string;
}

interface RemoveVideoFromLessonOutput {
  lessonId: string;
}

@Injectable()
export class RemoveVideoFromLessonUseCase {
  constructor(
    private lessonsRepository: LessonsRepository,
    private unitsRepository: UnitsRepository,
    private coursesRepository: CoursesRepository,
    private videoService: IVideoService,
  ) {}

  async execute(
    input: RemoveVideoFromLessonInput,
  ): Promise<Either<Error, RemoveVideoFromLessonOutput>> {
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
      lesson.removeVideo();
      await this.lessonsRepository.save(lesson);
    }

    return right({ lessonId: lesson.id.toString() });
  }
}

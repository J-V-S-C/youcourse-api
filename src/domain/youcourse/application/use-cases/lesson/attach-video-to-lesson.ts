import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { Video } from 'src/domain/youcourse/enterprise/entities/value-objects/video.vo';
import { LessonsRepository } from '../../repositories/lessons-repository';
import { UnitsRepository } from '../../repositories/units-repository';
import { CoursesRepository } from '../../repositories/courses-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { VideoService } from '../../services/video-service';

interface AttachVideoInput {
  creatorId: string;
  lessonId: string;
  filename: string;
  contentType: string;
}

interface AttachVideoOutput {
  lessonId: string;
  video: {
    externalId: string;
    uploadUrl: string;
  };
}

@Injectable()
export class AttachVideoToLessonUseCase {
  constructor(
    private lessonsRepository: LessonsRepository,
    private unitsRepository: UnitsRepository,
    private coursesRepository: CoursesRepository,
    private videoService: VideoService,
  ) {}

  async execute(
    input: AttachVideoInput,
  ): Promise<Either<Error, AttachVideoOutput>> {
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

    const uploadResult = await this.videoService.initiateUpload(
      input.filename,
      input.contentType,
    );

    const video = Video.createUploading({
      externalId: uploadResult.externalId,
      playbackUrl: uploadResult.uploadUrl,
    });

    lesson.attachVideo(video);

    await this.lessonsRepository.save(lesson);

    return right({
      lessonId: lesson.id.toString(),
      video: {
        externalId: uploadResult.externalId,
        uploadUrl: uploadResult.uploadUrl,
      },
    });
  }
}

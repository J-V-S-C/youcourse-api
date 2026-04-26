import { Prisma, Lesson as PrismaLesson } from '@prisma/client';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Lesson } from 'src/domain/youcourse/enterprise/entities/lesson';
import {
  Video,
  VideoStatus,
} from 'src/domain/youcourse/enterprise/entities/value-objects/video.vo';

export class PrismaLessonMapper {
  static toDomain(raw: PrismaLesson): Lesson {
    let video: Video | null = null;

    if (raw.video) {
      const videoData = raw.video as {
        externalId: string;
        playbackUrl: string;
        status: VideoStatus;
      };
      video = Video.createUploading({
        externalId: videoData.externalId,
        playbackUrl: videoData.playbackUrl,
      });
    }

    return Lesson.create(
      {
        unitId: new UniqueEntityID(raw.unitId),
        name: raw.name,
        description: raw.description ?? undefined,
        video,
        position: raw.position,
        isPreview: raw.isPreview,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt ?? null,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(lesson: Lesson): Prisma.LessonUncheckedCreateInput {
    return {
      id: lesson.id.toString(),
      unitId: lesson.unitId.toString(),
      name: lesson.name,
      description: lesson.description,
      video: lesson.video ? lesson.video.toJSON() : Prisma.JsonNull,
      position: lesson.position,
      isPreview: lesson.isPreview,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    };
  }
}

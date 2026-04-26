import type { Lesson } from 'src/domain/youcourse/enterprise/entities/lesson';

export class LessonPresenter {
  static toHTTP(lesson: Lesson) {
    return {
      id: lesson.id.toString(),
      unitId: lesson.unitId.toString(),
      name: lesson.name,
      description: lesson.description,
      position: lesson.position,
      isPreview: lesson.isPreview,
      video: lesson.video ? lesson.video.toJSON() : null,
      hasVideo: lesson.hasVideo,
      isVideoReady: lesson.isVideoReady,
      isVideoProcessing: lesson.isVideoProcessing,
      isVideoFailed: lesson.isVideoFailed,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    };
  }
}

import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Optional } from 'src/core/types/optional';
import { Video } from './value-objects/video.vo';

export interface LessonProps {
  unitId: UniqueEntityID;
  name: string;
  description?: string;
  video: Video | null;
  position: number;
  isPreview: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class Lesson extends Entity<LessonProps> {
  get unitId() {
    return this.props.unitId;
  }

  get name() {
    return this.props.name;
  }

  get description() {
    return this.props.description;
  }

  get video() {
    return this.props.video;
  }

  get position() {
    return this.props.position;
  }

  get isPreview() {
    return this.props.isPreview;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get hasVideo() {
    return this.props.video !== null && this.props.video.isReady;
  }

  get isVideoReady() {
    return this.props.video?.isReady ?? false;
  }

  get isVideoProcessing() {
    return this.props.video?.isProcessing ?? false;
  }

  get isVideoFailed() {
    return this.props.video?.isFailed ?? false;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  updateDetails(name: string, description?: string | null) {
    this.props.name = name;
    if (description === null) {
      this.props.description = undefined;
    } else if (description !== undefined) {
      this.props.description = description;
    }
    this.touch();
  }

  reorder(position: number) {
    this.props.position = position;
    this.touch();
  }

  setPreview(isPreview: boolean) {
    this.props.isPreview = isPreview;
    this.touch();
  }

  attachVideo(video: Video) {
    this.props.video = video;
    this.touch();
  }

  removeVideo() {
    this.props.video = null;
    this.touch();
  }

  static create(
    props: Optional<
      LessonProps,
      'createdAt' | 'position' | 'isPreview' | 'video'
    >,
    id?: UniqueEntityID,
  ) {
    const lesson = new Lesson(
      {
        ...props,
        video: props.video ?? null,
        position: props.position ?? 0,
        isPreview: props.isPreview ?? false,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    );
    return lesson;
  }

  static createWithVideo(
    props: {
      unitId: UniqueEntityID;
      name: string;
      description?: string;
      video: Video;
      position?: number;
      isPreview?: boolean;
    },
    id?: UniqueEntityID,
  ) {
    return Lesson.create(
      {
        ...props,
        position: props.position ?? 0,
        isPreview: props.isPreview ?? false,
      },
      id,
    );
  }

  static createPending(
    props: {
      unitId: UniqueEntityID;
      name: string;
      description?: string;
      position?: number;
      isPreview?: boolean;
    },
    id?: UniqueEntityID,
  ) {
    return Lesson.create(
      {
        ...props,
        position: props.position ?? 0,
        isPreview: props.isPreview ?? false,
        video: null,
      },
      id,
    );
  }
}

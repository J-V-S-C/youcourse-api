import { ValueObject } from 'src/core/entities/value-objects';

export enum VideoStatus {
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
}

export interface VideoProps {
  externalId: string;
  playbackUrl: string;
  thumbnailUrl?: string;
  status: VideoStatus;
  duration?: number;
  originalFilename?: string;
  createdAt: Date;
  updatedAt?: Date | null;
}

export interface CreateVideoProps {
  externalId: string;
  playbackUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  originalFilename?: string;
}

export interface VideoValueObjectProps {
  externalId: string;
  playbackUrl: string;
  thumbnailUrl?: string;
  status: VideoStatus;
  duration?: number;
  originalFilename?: string;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class Video extends ValueObject<VideoValueObjectProps> {
  get externalId() {
    return this.props.externalId;
  }

  get playbackUrl() {
    return this.props.playbackUrl;
  }

  get thumbnailUrl() {
    return this.props.thumbnailUrl;
  }

  get status() {
    return this.props.status;
  }

  get duration() {
    return this.props.duration;
  }

  get originalFilename() {
    return this.props.originalFilename;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get isReady() {
    return this.props.status === VideoStatus.READY;
  }

  get isProcessing() {
    return (
      this.props.status === VideoStatus.PROCESSING ||
      this.props.status === VideoStatus.UPLOADING
    );
  }

  get isFailed() {
    return this.props.status === VideoStatus.FAILED;
  }

  get formattedDuration(): string | null {
    if (!this.props.duration) return null;

    const hours = Math.floor(this.props.duration / 3600);
    const minutes = Math.floor((this.props.duration % 3600) / 60);
    const seconds = Math.floor(this.props.duration % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  markAsProcessing() {
    this.props.status = VideoStatus.PROCESSING;
    this.props.updatedAt = new Date();
  }

  markAsReady(playbackUrl: string, thumbnailUrl?: string, duration?: number) {
    this.props.status = VideoStatus.READY;
    this.props.playbackUrl = playbackUrl;
    if (thumbnailUrl) this.props.thumbnailUrl = thumbnailUrl;
    if (duration) this.props.duration = duration;
    this.props.updatedAt = new Date();
  }

  markAsFailed() {
    this.props.status = VideoStatus.FAILED;
    this.props.updatedAt = new Date();
  }

  static createUploading(props: { externalId: string; playbackUrl: string }) {
    return new Video({
      ...props,
      status: VideoStatus.UPLOADING,
      createdAt: new Date(),
      updatedAt: null,
    });
  }

  static createReady(props: {
    externalId: string;
    playbackUrl: string;
    thumbnailUrl?: string;
    duration?: number;
    originalFilename?: string;
  }) {
    return new Video({
      ...props,
      status: VideoStatus.READY,
      createdAt: new Date(),
      updatedAt: null,
    });
  }

  toJSON() {
    return {
      externalId: this.externalId,
      playbackUrl: this.playbackUrl,
      thumbnailUrl: this.thumbnailUrl,
      status: this.status,
      duration: this.duration,
      formattedDuration: this.formattedDuration,
      originalFilename: this.originalFilename,
    };
  }
}

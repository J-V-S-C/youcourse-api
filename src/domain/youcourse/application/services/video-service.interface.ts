import {
  Video,
  CreateVideoProps,
} from '../../enterprise/entities/value-objects/video.vo';

export interface UploadVideoResult {
  externalId: string;
  uploadUrl: string;
  status: 'uploading' | 'processing';
}

export interface VideoProcessingResult {
  externalId: string;
  playbackUrl: string;
  thumbnailUrl?: string;
  duration?: number;
}

export interface IVideoService {
  initiateUpload(
    filename: string,
    contentType: string,
  ): Promise<UploadVideoResult>;

  getVideoStatus(externalId: string): Promise<Video>;

  getSignedPlaybackUrl(
    externalId: string,
    expiresInSeconds?: number,
  ): Promise<string>;

  deleteVideo(externalId: string): Promise<void>;

  generateThumbnail(externalId: string): Promise<string | null>;
}

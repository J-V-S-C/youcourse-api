import {
  Video,
} from '../../enterprise/entities/value-objects/video.vo';

export interface UploadVideoResult {
  externalId: string;
  uploadUrl: string;
  status: 'uploading' | 'processing';
}

export abstract class VideoService {
  abstract initiateUpload(
    filename: string,
    contentType: string,
  ): Promise<UploadVideoResult>;

  abstract getVideoStatus(externalId: string): Promise<Video>;

  abstract getSignedPlaybackUrl(
    externalId: string,
    expiresInSeconds?: number,
  ): Promise<string>;

  abstract deleteVideo(externalId: string): Promise<void>;

  abstract generateThumbnail(externalId: string): Promise<string | null>;
}

import type { VideoService } from 'src/domain/youcourse/application/services/video-service';
import { Video } from 'src/domain/youcourse/enterprise/entities/value-objects/video.vo';

export class InMemoryVideoService implements VideoService {
  private videos: Map<string, Video> = new Map();

  async initiateUpload(
    filename: string,
    contentType: string,
  ): Promise<{
    externalId: string;
    uploadUrl: string;
    playbackUrl: string;
    status: 'uploading' | 'processing';
  }> {
    const externalId = `video-${Date.now()}`;
    const uploadUrl = `https://upload.example.com/${externalId}`;
    const playbackUrl = ``;
    return {
      externalId,
      uploadUrl,
      playbackUrl,
      status: 'uploading',
    };
  }

  async getVideoStatus(externalId: string): Promise<Video> {
    const video = this.videos.get(externalId);
    if (!video) {
      throw new Error('Video not found');
    }
    return video;
  }

  async getSignedPlaybackUrl(
    externalId: string,
    expiresInSeconds?: number,
  ): Promise<string> {
    return `https://cdn.example.com/${externalId}.m3u8?token=abc123`;
  }

  async deleteVideo(externalId: string): Promise<void> {
    this.videos.delete(externalId);
  }

  async generateThumbnail(externalId: string): Promise<string | null> {
    return `https://cdn.example.com/${externalId}-thumb.jpg`;
  }
}

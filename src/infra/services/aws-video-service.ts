import { Injectable } from '@nestjs/common';
import { Video } from 'src/domain/youcourse/enterprise/entities/value-objects/video.vo';
import {
  VideoService,
  UploadVideoResult,
} from 'src/domain/youcourse/application/services/video-service';
import { EnvService } from '../env/env.service';
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const {
  getSignedUrl: getS3SignedUrl,
} = require('@aws-sdk/s3-request-presigner');
@Injectable()
export class AWSVideoService implements VideoService {
  private readonly s3Client: InstanceType<typeof S3Client>;
  private readonly bucket: string;
  private readonly cloudfrontUrl: string;

  constructor(private envService: EnvService) {
    this.s3Client = new S3Client({
      region: this.envService.get('AWS_REGION') as string,
      credentials: {
        accessKeyId: this.envService.get('AWS_ACCESS_KEY_ID') as string,
        secretAccessKey: this.envService.get('AWS_SECRET_ACCESS_KEY') as string,
      },
    });
    this.bucket = this.envService.get('AWS_S3_BUCKET_NAME') as string;
    this.cloudfrontUrl = this.envService.get('AWS_CLOUDFRONT_URL') as string;
  }

  async initiateUpload(
    filename: string,
    contentType: string,
  ): Promise<UploadVideoResult> {
    const externalId = `video-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: externalId,
      ContentType: contentType,
    });

    const uploadUrl = await getS3SignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });

    return {
      externalId,
      uploadUrl,
      playbackUrl: `https://${this.cloudfrontUrl}/${externalId}`,
      status: 'uploading',
    };
  }

  async getVideoStatus(externalId: string): Promise<Video> {
    return Video.createUploading({
      externalId,
      playbackUrl: `https://${this.cloudfrontUrl}/${externalId}`,
    });
  }

  async getSignedPlaybackUrl(
    externalId: string,
    expiresInSeconds?: number,
  ): Promise<string> {
    return `${this.cloudfrontUrl}/${externalId}`;
  }

  async deleteVideo(externalId: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: externalId,
    });

    await this.s3Client.send(command);
  }

  async generateThumbnail(externalId: string): Promise<string | null> {
    return `${this.cloudfrontUrl}/${externalId}-thumb.jpg`;
  }
}

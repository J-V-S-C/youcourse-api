import { Module } from '@nestjs/common';
import { NodemailerEmailService } from './nodemailer-email-service';
import { EnvModule } from '../env/env.module';
import { EmailService } from 'src/domain/youcourse/application/services/email-service';
import { VideoService } from 'src/domain/youcourse/application/services/video-service';
import { AWSVideoService } from './aws-video-service';

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: EmailService,
      useClass: NodemailerEmailService,
    },
    {
      provide: VideoService,
      useClass: AWSVideoService,
    },
  ],
  exports: [EmailService, VideoService],
})
export class ServicesModule {}

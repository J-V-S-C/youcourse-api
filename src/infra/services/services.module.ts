import { Module } from '@nestjs/common';
import { NodemailerEmailService } from './nodemailer-email-service';
import { EnvModule } from '../env/env.module';
import { EmailService } from 'src/domain/youcourse/application/services/email-service';
import { VideoService } from 'src/domain/youcourse/application/services/video-service';
import { AWSVideoService } from './aws-video-service';
import { PaymentGateway } from 'src/domain/youcourse/application/services/payment-gateway';
import { InfinitePayPaymentGateway } from './infinite-pay-payment-gateway';

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
    {
      provide: PaymentGateway,
      useClass: InfinitePayPaymentGateway,
    },
  ],
  exports: [EmailService, VideoService, PaymentGateway],
})
export class ServicesModule {}

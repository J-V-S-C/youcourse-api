import { Module } from '@nestjs/common';
import { NodemailerEmailService } from './nodemailer-email-service';
import { EmailService } from 'src/domain/youcourse/application/services/emailService';
import { EnvModule } from '../env/env.module';

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: EmailService,
      useClass: NodemailerEmailService,
    },
  ],
  exports: [EmailService],
})
export class ServicesModule {}

import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailService } from 'src/domain/youcourse/application/services/email-service';
import { EnvService } from '../env/env.service';

@Injectable()
export class NodemailerEmailService implements EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private envService: EnvService) {
    this.transporter = nodemailer.createTransport({
      host: this.envService.get('SMTP_HOST'),
      port: this.envService.get('SMTP_PORT'),
      secure: this.envService.get('SMTP_PORT') === 465,
      auth: {
        user: this.envService.get('SMTP_USER') ?? '',
        pass: this.envService.get('SMTP_PASS') ?? '',
      },
    });
  }

  async sendMail(params: {
    to: string;
    subject: string;
    body: string;
  }): Promise<void> {
    await this.transporter.sendMail({
      from: '"YouCourse API" <noreply@youcourse.com>',
      to: params.to,
      subject: params.subject,
      text: params.body,
    });
  }
}

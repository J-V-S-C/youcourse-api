import { EmailService } from 'src/domain/youcourse/application/services/emailService';

export class FakeEmailService implements EmailService {
  public sent: { to: string; subject: string; body: string }[] = [];

  async sendMail(params: { to: string; subject: string; body: string }): Promise<void> {
    this.sent.push(params);
  }
}

export abstract class EmailService {
  abstract sendMail(params: {
    to: string;
    subject: string;
    body: string;
  }): Promise<void>;
}
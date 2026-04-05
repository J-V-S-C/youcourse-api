import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { DatabaseModule } from 'src/infra/database/database.module';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { EmailService } from 'src/domain/youcourse/application/services/emailService';

describe('Request Password Reset (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accountFactory: AccountFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AccountFactory],
    }).compile();

    accountFactory = moduleRef.get(AccountFactory);
    prisma = moduleRef.get(PrismaService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await request('http://localhost:1080').delete('/emails');
  });

  test('[POST] /accounts/password-reset - Success', async () => {
    const email = 'jhon@example.com';
    await accountFactory.makePrismaAccount({
      email,
    });

    const response = await request(app.getHttpServer())
      .post('/accounts/password-reset')
      .send({
        email,
      });

    expect(response.statusCode).toBe(200);

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        account: {
          email,
        },
      },
    });

    expect(resetToken).toBeTruthy();

    const emailResponse = await request('http://localhost:1080').get('/emails');
    const emails = emailResponse.body;
    expect(emails).toHaveLength(1);
    expect(emails[0]).toContain(resetToken!.token);
    expect(emails[0]).toContain(email);
  });

  test('[POST] /accounts/password-reset - Account Not Found', async () => {
    const response = await request(app.getHttpServer())
      .post('/accounts/password-reset')
      .send({
        email: 'nobody@example.com',
      });

    expect(response.statusCode).toBe(400); // Because we map ResourceNotFound to BadRequest in controller
  });
});

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { EmailService } from 'src/domain/youcourse/application/services/emailService';
import { hash } from 'bcryptjs';

const mockEmailService = {
  sendMail: vi.fn(),
};

describe('Edit Password (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accountFactory: AccountFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AccountFactory],
    })
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .compile();

    accountFactory = moduleRef.get(AccountFactory);
    prisma = moduleRef.get(PrismaService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    // CORREÇÃO: Limpa o mock em vez de chamar localhost:1080
    mockEmailService.sendMail.mockClear();
  });

  test('[PATCH] /accounts/password-reset - Success', async () => {
    const email = 'jhon@example.com';
    const account = await accountFactory.makePrismaAccount({
      email,
      password: await hash('oldpassword', 8),
    });

    const token = await prisma.passwordResetToken.create({
      data: {
        accountId: account.id.toString(),
        token: 'valid-reset-token-123',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours
      },
    });

    const response = await request(app.getHttpServer())
      .post('/accounts/password')
      .send({
        token: token.token,
        newPassword: 'newpassword123',
      });

    if (response.statusCode === 500) {
      console.error('EDIT PASSWORD 500 ERROR:', response.body);
    }

    expect(response.statusCode).toBe(200);

    const updatedAccount = await prisma.account.findUnique({
      where: { id: account.id.toString() },
    });

    expect(updatedAccount).toBeTruthy();

    // CORREÇÃO: Verifica o mock em vez de fazer requisição HTTP
    expect(mockEmailService.sendMail).toHaveBeenCalledTimes(1);
    expect(mockEmailService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: account.email,
      }),
    );
  });

  test('[PATCH] /accounts/password-reset - Invalid or Expired Token', async () => {
    const response = await request(app.getHttpServer())
      .post('/accounts/password')
      .send({
        token: 'invalid-or-fake-token',
        newPassword: 'newpassword123',
      });

    expect(response.statusCode).toBe(400);
  });
});

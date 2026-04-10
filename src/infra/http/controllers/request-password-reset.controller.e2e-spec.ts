import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { DatabaseModule } from 'src/infra/database/database.module';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { EmailService } from 'src/domain/youcourse/application/services/emailService';

const mockEmailService = {
  sendMail: vi.fn(),
};

describe('Request Password Reset (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accountFactory: AccountFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AccountFactory],
    })
      // 2. Sobrescreve o provedor
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .compile();

    accountFactory = moduleRef.get(AccountFactory);
    prisma = moduleRef.get(PrismaService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    // 3. Limpa o histórico do mock em vez de chamar localhost:1080
    mockEmailService.sendMail.mockClear();
  });

  test('[POST] /accounts/password-reset - Success', async () => {
    const email = 'jhon@example.com';
    await accountFactory.makePrismaAccount({ email });

    const response = await request(app.getHttpServer())
      .post('/accounts/password-reset')
      .send({ email });

    expect(response.statusCode).toBe(200);

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { account: { email } },
    });

    expect(resetToken).toBeTruthy();

    // 4. Verifica se o método sendMail foi chamado com os dados certos
    expect(mockEmailService.sendMail).toHaveBeenCalledTimes(1);
    expect(mockEmailService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email,
        body: expect.stringContaining(resetToken!.token),
      }),
    );
  });

  test('[POST] /accounts/password-reset - Account Not Found', async () => {
    const response = await request(app.getHttpServer())
      .post('/accounts/password-reset')
      .send({ email: 'nobody@example.com' });

    expect(response.statusCode).toBe(400);
  });
});

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { hash } from 'bcryptjs';

describe('Refresh Token (E2E)', () => {
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

  test('[POST] /sessions/refresh - Success', async () => {
    const email = 'refresh@example.com';
    const account = await accountFactory.makePrismaAccount({
      email,
      password: await hash('password123', 8),
    });

    const mockRefreshToken = 'mock-refresh-token-valid';

    await prisma.refreshToken.create({
      data: {
        accountId: account.id.toString(),
        token: mockRefreshToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      },
    });

    const response = await request(app.getHttpServer())
      .post('/sessions/refresh')
      .send({
        refreshToken: mockRefreshToken,
      });

    if (response.statusCode === 500) console.log('500 ERROR:', response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
    });

    const oldToken = await prisma.refreshToken.findFirst({
      where: { token: mockRefreshToken },
    });
    // the old token gets deleted (cascade/reused) or a new one is created.
    // Ensure the old token no longer exists in case of token rotation
    expect(oldToken).toBeNull();
  });

  test('[POST] /sessions/refresh - Invalid or Expired Token', async () => {
    const response = await request(app.getHttpServer())
      .post('/sessions/refresh')
      .send({
        refreshToken: 'invalid-or-fake-token',
      });

    expect(response.statusCode).toBe(401);
  });
});

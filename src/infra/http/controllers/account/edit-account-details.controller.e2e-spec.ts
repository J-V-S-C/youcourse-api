import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';

describe('Edit Account (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accountFactory: AccountFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AccountFactory],
    }).compile();

    accountFactory = moduleRef.get(AccountFactory);

    jwt = moduleRef.get(JwtService);
    prisma = moduleRef.get(PrismaService);

    app = moduleRef.createNestApplication();

    await app.init();
  });

  test('[PATCH] /accounts/:id', async () => {
    const name = 'Jhon Doe';
    const email = 'jhon@example.com';

    const account = await accountFactory.makePrismaAccount({
      name,
      email,
    });

    const accountId = account.id.toString();

    const accessToken = jwt.sign({ sub: accountId });

    const response = await request(app.getHttpServer())
      .patch(`/accounts/${accountId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'New name',
        email: 'newEmail@email.com',
      });

    const updated = await prisma.account.findUnique({
      where: { id: accountId },
    });

    expect(response.status).toEqual(200);
    expect(updated?.name).toBe('New name');
    expect(updated?.email).toBe('newEmail@email.com');
  });
});

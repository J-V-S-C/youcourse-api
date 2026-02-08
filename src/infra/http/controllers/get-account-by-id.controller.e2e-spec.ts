import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { AccountFactory } from 'test/factories/make-account';
import request from 'supertest';
import { DatabaseModule } from 'src/infra/database/database.module';
import { JwtService } from '@nestjs/jwt';

describe('Get Account (E2E)', () => {
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

  test('[GET] /accounts/:id', async () => {
    const user = await accountFactory.makePrismaAccount({
      name: 'John Doe',
    });
    const userId = user.id.toString();
    const accessToken = jwt.sign({ sub: userId });

    const response = await request(app.getHttpServer())
      .get(`/accounts/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.account.name).toBe('John Doe');
  });
});

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import request from 'supertest';

describe('Create Account (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

    await app.init();
  });

  test('[POST] /accounts', async () => {
    const name = 'Jhon Doe';
    const email = 'jhon@example.com';
    const password = '123456';

    const response = await request(app.getHttpServer()).post('/accounts').send({
      name,
      email,
      password,
    });

    expect(response.statusCode).toBe(201);

    const userExists = await prisma.account.findUnique({
      where: {
        email,
      },
    });

    expect(userExists).toBeTruthy();
  });
});

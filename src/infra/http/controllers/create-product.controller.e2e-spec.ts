import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import request from 'supertest';
import { AccountFactory } from 'test/factories/make-account';

describe('Create Product (E2E)', () => {
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

  test('[POST] /products', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const response = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Computer',
        description: 'In good state',
        price: {
          amount: 10.99,
          currency: 'USD',
        },
      });

    expect(response.statusCode).toBe(201);

    const productOnDatabase = await prisma.product.findFirst({
      where: {
        name: 'Computer',
      },
    });
    expect(productOnDatabase).toBeTruthy();
  });
});

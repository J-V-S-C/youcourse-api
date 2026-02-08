import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import request from 'supertest';
import { AccountFactory } from 'test/factories/make-account';
import { ProductFactory } from 'test/factories/make-product';

describe('Rate Product (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accountFactory: AccountFactory;
  let productFacotory: ProductFactory;
  let jwt: JwtService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AccountFactory, ProductFactory],
    }).compile();

    accountFactory = moduleRef.get(AccountFactory);
    productFacotory = moduleRef.get(ProductFactory);

    jwt = moduleRef.get(JwtService);
    prisma = moduleRef.get(PrismaService);
    app = moduleRef.createNestApplication();

    await app.init();
  });

  test('[POST] /products/:productId/rating', async () => {
    const user = await accountFactory.makePrismaAccount();
    const product = await productFacotory.makePrismaProduct({
      creatorId: user.id,
    });

    const accessToken = jwt.sign({ sub: user.id.toString() });
    const productId = product.id.toString();

    const response = await request(app.getHttpServer())
      .post(`/products/${productId}/rating`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        stars: '1.5',
        commentary: 'Good product!',
      });

    expect(response.statusCode).toBe(201);

    const ratingOnDatabase = await prisma.rating.findFirst({
      where: {
        commentary: 'Good product!',
      },
    });

    expect(ratingOnDatabase).toBeTruthy();
  });
});

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { ProductFactory } from 'test/factories/prisma/prisma-product-factory';

describe('Fetch Products (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accountFactory: AccountFactory;
  let productFactory: ProductFactory;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AccountFactory, ProductFactory],
    }).compile();

    accountFactory = moduleRef.get(AccountFactory);
    productFactory = moduleRef.get(ProductFactory);

    prisma = moduleRef.get(PrismaService);
    app = moduleRef.createNestApplication();

    await app.init();
  });

  test('[GET] /products', async () => {
    const user = await accountFactory.makePrismaAccount();

    await Promise.all([
      productFactory.makePrismaProduct({
        creatorId: user.id,
        name: 'Product 01',
        visible: true,
        createdAt: new Date(2026, 6, 30),
      }),
      productFactory.makePrismaProduct({
        creatorId: user.id,
        name: 'Product 02',
        visible: true,
        createdAt: new Date(2023, 0, 15),
      }),
    ]);

    const response = await request(app.getHttpServer()).get(
      '/products?orderBy=recent',
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.products).toHaveLength(2);
    expect(response.body.products[0].name).toBe('Product 01');
    expect(response.body.products[1].name).toBe('Product 02');
  });
});

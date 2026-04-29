import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { CourseFactory } from 'test/factories/prisma/prisma-course-factory';
import { Price } from 'src/domain/youcourse/enterprise/entities/value-objects/price';

describe('Payment Webhook (E2E)', () => {
  let app: INestApplication;
  let accountFactory: AccountFactory;
  let courseFactory: CourseFactory;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AccountFactory, CourseFactory],
    }).compile();

    accountFactory = moduleRef.get(AccountFactory);
    courseFactory = moduleRef.get(CourseFactory);
    prisma = moduleRef.get(PrismaService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  test('[POST] /payments/webhook - Success', async () => {
    const user = await accountFactory.makePrismaAccount();
    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
      price: Price.create({ amount: 5000, currency: 'BRL' }),
      sellable: true,
    });

    const payment = await prisma.payment.create({
      data: {
        courseId: course.id.toString(),
        accountId: user.id.toString(),
        amount: 5000,
        status: 'PENDING',
      },
    });

    const response = await request(app.getHttpServer())
      .post('/payments/webhook')
      .send({
        order_nsu: payment.id,
        transaction_nsu: 'infinitepay-txn-123',
        amount: 5000,
        invoice_slug: 'slug-abc',
        status: 'approved',
      });

    expect(response.statusCode).toBe(200);

    const paymentOnDb = await prisma.payment.findUnique({
      where: { id: payment.id },
    });

    expect(paymentOnDb?.status).toBe('PAID');
    expect(paymentOnDb?.transactionNsu).toBe('infinitepay-txn-123');
  });

  test('[POST] /payments/webhook - Amount mismatch', async () => {
    const user = await accountFactory.makePrismaAccount();
    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
      price: Price.create({ amount: 10000, currency: 'BRL' }),
      sellable: true,
    });

    const payment = await prisma.payment.create({
      data: {
        courseId: course.id.toString(),
        accountId: user.id.toString(),
        amount: 10000,
        status: 'PENDING',
      },
    });

    const response = await request(app.getHttpServer())
      .post('/payments/webhook')
      .send({
        order_nsu: payment.id,
        transaction_nsu: 'infinitepay-txn-999',
        amount: 5000,
      });

    expect(response.statusCode).toBe(400);

    const paymentOnDb = await prisma.payment.findUnique({
      where: { id: payment.id },
    });

    expect(paymentOnDb?.status).toBe('PENDING');
    expect(paymentOnDb?.transactionNsu).toBeNull();
  });
});

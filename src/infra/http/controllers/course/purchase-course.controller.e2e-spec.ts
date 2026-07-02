import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { CourseFactory } from 'test/factories/prisma/prisma-course-factory';
import { Price } from 'src/domain/youcourse/enterprise/entities/value-objects/price';

describe('Purchase Course (E2E)', () => {
  let app: INestApplication;
  let accountFactory: AccountFactory;
  let courseFactory: CourseFactory;
  let jwt: JwtService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AccountFactory, CourseFactory],
    }).compile();

    accountFactory = moduleRef.get(AccountFactory);
    courseFactory = moduleRef.get(CourseFactory);
    jwt = moduleRef.get(JwtService);
    prisma = moduleRef.get(PrismaService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  test('[POST] /courses/:courseId/purchase', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
      price: Price.create({ amount: 5000, currency: 'BRL' }),
      sellable: true,
      visible: true,
    });

    const response = await request(app.getHttpServer())
      .post(`/courses/${course.id.toString()}/purchase`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('paymentUrl');

    // Validação de persistência no banco de dados via Prisma
    const paymentOnDb = await prisma.payment.findFirst({
      where: {
        accountId: user.id.toString(),
        courseId: course.id.toString(),
      },
    });

    expect(paymentOnDb).toBeTruthy();
    expect(paymentOnDb?.status).toBe('PENDING');
    expect(paymentOnDb?.amount).toBe(5000);
    expect(paymentOnDb?.paymentUrl).toBe(response.body.paymentUrl);
  });
});

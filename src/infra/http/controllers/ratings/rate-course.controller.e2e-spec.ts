import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { CourseFactory } from 'test/factories/prisma/prisma-course-factory';

describe('Rate Course (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accountFactory: AccountFactory;
  let courseFacotory: CourseFactory;
  let jwt: JwtService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AccountFactory, CourseFactory],
    }).compile();

    accountFactory = moduleRef.get(AccountFactory);
    courseFacotory = moduleRef.get(CourseFactory);

    jwt = moduleRef.get(JwtService);
    prisma = moduleRef.get(PrismaService);
    app = moduleRef.createNestApplication();

    await app.init();
  });

  test('[POST] /courses/:courseId/rating', async () => {
    const user = await accountFactory.makePrismaAccount();
    const course = await courseFacotory.makePrismaCourse({
      creatorId: user.id,
    });

    const accessToken = jwt.sign({ sub: user.id.toString() });
    const courseId = course.id.toString();

    const response = await request(app.getHttpServer())
      .post(`/courses/${courseId}/rating`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        stars: '1.5',
        commentary: 'Good course!',
      });

    expect(response.statusCode).toBe(201);

    const ratingOnDatabase = await prisma.rating.findFirst({
      where: {
        commentary: 'Good course!',
      },
    });

    expect(ratingOnDatabase).toBeTruthy();
  });
});

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { CourseFactory } from 'test/factories/prisma/prisma-course-factory';

describe('Get Public Course (E2E)', () => {
  let app: INestApplication;
  let accountFactory: AccountFactory;
  let courseFactory: CourseFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AccountFactory, CourseFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    accountFactory = moduleRef.get(AccountFactory);
    courseFactory = moduleRef.get(CourseFactory);
    await app.init();
  });

  test('[GET] /courses/:id', async () => {
    const user = await accountFactory.makePrismaAccount();
    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
      name: 'Public Course',
      visible: true,
    });

    const response = await request(app.getHttpServer()).get(
      `/courses/${course.id.toString()}`,
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.course.name).toBe('Public Course');
  });

  test('[GET] /courses/:id (Hidden course should return 404)', async () => {
    const user = await accountFactory.makePrismaAccount();
    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
      visible: false,
    });

    const response = await request(app.getHttpServer()).get(
      `/courses/${course.id.toString()}`,
    );

    expect(response.statusCode).toBe(404);
  });
});

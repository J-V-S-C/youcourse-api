import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { CourseFactory } from 'test/factories/prisma/prisma-course-factory';

describe('Fetch Courses (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accountFactory: AccountFactory;
  let courseFactory: CourseFactory;
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

  test('[GET] /courses', async () => {
    const user = await accountFactory.makePrismaAccount();

    await Promise.all([
      courseFactory.makePrismaCourse({
        creatorId: user.id,
        name: 'Course 01',
        visible: true,
        createdAt: new Date(2026, 6, 30),
      }),
      courseFactory.makePrismaCourse({
        creatorId: user.id,
        name: 'Course 02',
        visible: true,
        createdAt: new Date(2023, 0, 15),
      }),
    ]);

    const response = await request(app.getHttpServer()).get(
      '/courses',
    ).query({ page: 1, orderBy: 'recent' });

    expect(response.statusCode).toBe(200);
    expect(response.body.courses).toHaveLength(2);
    expect(response.body.courses[0].name).toBe('Course 01');
    expect(response.body.courses[1].name).toBe('Course 02');
  });
});

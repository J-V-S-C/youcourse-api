import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { CourseFactory } from 'test/factories/prisma/prisma-course-factory';
import { UnitFactory } from 'test/factories/prisma/prisma-unit-factory';
import { vi } from 'vitest';

describe('Fetch Units (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accountFactory: AccountFactory;
  let courseFactory: CourseFactory;
  let unitFactory: UnitFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AccountFactory, CourseFactory, UnitFactory],
    }).compile();

    accountFactory = moduleRef.get(AccountFactory);
    courseFactory = moduleRef.get(CourseFactory);
    unitFactory = moduleRef.get(UnitFactory);
    jwt = moduleRef.get(JwtService);
    prisma = moduleRef.get(PrismaService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  test('[GET] /courses/:courseId/units - Success', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
    });

    await unitFactory.makePrismaUnit({
      courseId: course.id,
      name: 'Unit 1',
      position: 0,
    });

    await unitFactory.makePrismaUnit({
      courseId: course.id,
      name: 'Unit 2',
      position: 1,
    });

    const response = await request(app.getHttpServer())
      .get(`/courses/${course.id.toString()}/units`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.units).toHaveLength(2);
    expect(response.body.units[0].name).toBe('Unit 1');
    expect(response.body.units[1].name).toBe('Unit 2');
  });

  test('[GET] /courses/:courseId/units - Empty course', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
    });

    const response = await request(app.getHttpServer())
      .get(`/courses/${course.id.toString()}/units`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.units).toHaveLength(0);
  });

  test('[GET] /courses/:courseId/units - Units sorted by position', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
    });

    await unitFactory.makePrismaUnit({
      courseId: course.id,
      name: 'Unit B',
      position: 1,
    });

    await unitFactory.makePrismaUnit({
      courseId: course.id,
      name: 'Unit A',
      position: 0,
    });

    const response = await request(app.getHttpServer())
      .get(`/courses/${course.id.toString()}/units`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.units[0].name).toBe('Unit A');
    expect(response.body.units[1].name).toBe('Unit B');
  });
});

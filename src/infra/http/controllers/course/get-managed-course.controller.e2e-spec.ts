import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { CourseFactory } from 'test/factories/prisma/prisma-course-factory';
import { JwtService } from '@nestjs/jwt';

describe('Get Managed Course (E2E)', () => {
  let app: INestApplication;
  let accountFactory: AccountFactory;
  let courseFactory: CourseFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AccountFactory, CourseFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    accountFactory = moduleRef.get(AccountFactory);
    courseFactory = moduleRef.get(CourseFactory);
    jwt = moduleRef.get(JwtService);
    await app.init();
  });

  test('[GET] /courses/managed/:id', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });
    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
      visible: false, // Dono deve conseguir ver mesmo oculto
    });

    const response = await request(app.getHttpServer())
      .get(`/courses/managed/${course.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.course.id).toBe(course.id.toString());
  });

  test('[GET] /courses/managed/:id (Forbidden for non-owners)', async () => {
    const owner = await accountFactory.makePrismaAccount();
    const attacker = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: attacker.id.toString() });
    const course = await courseFactory.makePrismaCourse({
      creatorId: owner.id,
    });

    const response = await request(app.getHttpServer())
      .get(`/courses/managed/${course.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(403);
  });

  test('[GET] /courses/managed/:id (Unauthorized)', async () => {
    const user = await accountFactory.makePrismaAccount();
    const course = await courseFactory.makePrismaCourse({ creatorId: user.id });

    const response = await request(app.getHttpServer()).get(
      `/courses/managed/${course.id.toString()}`,
    );

    expect(response.statusCode).toBe(401);
  });
});

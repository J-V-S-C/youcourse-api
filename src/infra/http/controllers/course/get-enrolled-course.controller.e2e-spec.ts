import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { CourseFactory } from 'test/factories/prisma/prisma-course-factory';
import { EnrollmentFactory } from 'test/factories/prisma/prisma-enrollment-factory';
import { JwtService } from '@nestjs/jwt';

describe('Get Enrolled Course (E2E)', () => {
  let app: INestApplication;
  let accountFactory: AccountFactory;
  let courseFactory: CourseFactory;
  let enrollmentFactory: EnrollmentFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AccountFactory, CourseFactory, EnrollmentFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    accountFactory = moduleRef.get(AccountFactory);
    courseFactory = moduleRef.get(CourseFactory);
    enrollmentFactory = moduleRef.get(EnrollmentFactory);
    jwt = moduleRef.get(JwtService);
    await app.init();
  });

  test('[GET] /courses/enrolled/:id', async () => {
    const owner = await accountFactory.makePrismaAccount();
    const student = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: student.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: owner.id,
      visible: false,
    });

    await enrollmentFactory.makePrismaEnrollment({
      studentId: student.id,
      courseId: course.id,
    });

    const response = await request(app.getHttpServer())
      .get(`/courses/enrolled/${course.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.course.id).toBe(course.id.toString());
  });

  test('[GET] /courses/enrolled/:id (404 for students without active enrollment on private course)', async () => {
    const owner = await accountFactory.makePrismaAccount();
    const student = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: student.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: owner.id,
      visible: false,
    });

    const response = await request(app.getHttpServer())
      .get(`/courses/enrolled/${course.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
  });

  test('[GET] /courses/enrolled/:id (Unauthorized if no token is provided)', async () => {
    const owner = await accountFactory.makePrismaAccount();
    const course = await courseFactory.makePrismaCourse({
      creatorId: owner.id,
    });

    const response = await request(app.getHttpServer()).get(
      `/courses/enrolled/${course.id.toString()}`,
    );

    expect(response.statusCode).toBe(401);
  });
});

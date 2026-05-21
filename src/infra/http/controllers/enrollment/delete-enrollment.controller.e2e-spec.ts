import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { CourseFactory } from 'test/factories/prisma/prisma-course-factory';
import { EnrollmentFactory } from 'test/factories/prisma/prisma-enrollment-factory';
import { JwtService } from '@nestjs/jwt';

describe('Delete Enrollment (E2E)', () => {
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

  test('[DELETE] /courses/:courseId/enrollment', async () => {
    const student = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: student.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: student.id,
    });

    await enrollmentFactory.makePrismaEnrollment({
      studentId: student.id,
      courseId: course.id,
    });

    const response = await request(app.getHttpServer())
      .delete(`/courses/${course.id.toString()}/enrollment`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(204);
  });

  test('[DELETE] /courses/:courseId/enrollment (404 if enrollment does not exist)', async () => {
    const student = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: student.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: student.id,
    });

    const response = await request(app.getHttpServer())
      .delete(`/courses/${course.id.toString()}/enrollment`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
  });
});

import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { CourseFactory } from 'test/factories/prisma/prisma-course-factory';
import { EnrollmentFactory } from 'test/factories/prisma/prisma-enrollment-factory';
import { JwtService } from '@nestjs/jwt';

describe('Fetch Enrolled Courses (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
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
    prisma = moduleRef.get(PrismaService);
    accountFactory = moduleRef.get(AccountFactory);
    courseFactory = moduleRef.get(CourseFactory);
    enrollmentFactory = moduleRef.get(EnrollmentFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test('[GET] /enrollments/me', async () => {
    const user = await accountFactory.makePrismaAccount();
    const token = jwt.sign({ sub: user.id.toString() });

    const course1 = await courseFactory.makePrismaCourse({ name: 'Course 1', creatorId: user.id });
    const course2 = await courseFactory.makePrismaCourse({ name: 'Course 2', creatorId: user.id });

    await enrollmentFactory.makePrismaEnrollment({
      studentId: user.id,
      courseId: course1.id,
    });
    await enrollmentFactory.makePrismaEnrollment({
      studentId: user.id,
      courseId: course2.id,
    });

    const response = await request(app.getHttpServer())
      .get('/enrollments/me')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body.courses).toHaveLength(2);
    expect(response.body.courses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: course1.id.toString(), name: 'Course 1' }),
        expect.objectContaining({ id: course2.id.toString(), name: 'Course 2' }),
      ])
    );
  });
});

import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { CourseFactory } from 'test/factories/prisma/prisma-course-factory'; // Certifique-se de importar sua fábrica de cursos

describe('Create Enrollment (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accountFactory: AccountFactory;
  let courseFactory: CourseFactory;
  let jwt: JwtService;

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

  test('[POST] /enrollments', async () => {
    const student = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: student.id.toString() });

    const creator = await accountFactory.makePrismaAccount();
    const course = await courseFactory.makePrismaCourse({
      creatorId: creator.id,
    });

    const response = await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        courseId: course.id.toString(),
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      enrollment: expect.objectContaining({
        id: expect.any(String),
        courseId: course.id.toString(),
        studentId: student.id.toString(),
      }),
    });

    const enrollmentOnDatabase = await prisma.enrollment.findFirst({
      where: {
        studentId: student.id.toString(),
        courseId: course.id.toString(),
      },
    });

    expect(enrollmentOnDatabase).toBeTruthy();
  });

  test('[POST] /enrollments (Bad Request - Invalid UUID)', async () => {
    const student = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: student.id.toString() });

    const response = await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        courseId: 'invalid-course-uuid',
      });

    expect(response.statusCode).toBe(400);
  });
});

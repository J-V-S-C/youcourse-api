import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { CourseFactory } from 'test/factories/prisma/prisma-course-factory';
import { vi } from 'vitest';

describe('Create Unit (E2E)', () => {
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

  test('[POST] /courses/:courseId/units - Success', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
    });

    const response = await request(app.getHttpServer())
      .post(`/courses/${course.id.toString()}/units`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Introduction Unit',
        description: 'Learn the basics',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.unit).toHaveProperty('id');
    expect(response.body.unit.name).toBe('Introduction Unit');
    expect(response.body.unit.description).toBe('Learn the basics');
  });

  test('[POST] /courses/:courseId/units - With position', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
    });

    const response = await request(app.getHttpServer())
      .post(`/courses/${course.id.toString()}/units`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Positioned Unit',
        position: 5,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.unit.position).toBe(5);
  });

  test('[POST] /courses/:courseId/units - Course not found', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const response = await request(app.getHttpServer())
      .post('/courses/non-existent-course/units')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Unit',
      });

    expect(response.statusCode).toBe(400);
  });

  test('[POST] /courses/:courseId/units - Not the course creator', async () => {
    const owner = await accountFactory.makePrismaAccount();
    const otherUser = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: otherUser.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: owner.id,
    });

    const response = await request(app.getHttpServer())
      .post(`/courses/${course.id.toString()}/units`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Unit',
      });

    expect(response.statusCode).toBe(400);
  });

  test('[POST] /courses/:courseId/units - Without auth', async () => {
    const user = await accountFactory.makePrismaAccount();

    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
    });

    const response = await request(app.getHttpServer())
      .post(`/courses/${course.id.toString()}/units`)
      .send({
        name: 'Unit',
      });

    expect(response.statusCode).toBe(401);
  });

  test('[POST] /courses/:courseId/units - Invalid name (too long)', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
    });

    const response = await request(app.getHttpServer())
      .post(`/courses/${course.id.toString()}/units`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'a'.repeat(101),
      });

    expect(response.statusCode).toBe(400);
  });
});

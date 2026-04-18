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

describe('Edit Lesson Details (E2E)', () => {
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

  test('[PATCH] /lessons/:lessonId - Success', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
    });

    const unit = await unitFactory.makePrismaUnit({
      courseId: course.id,
    });

    const lessonResponse = await request(app.getHttpServer())
      .post(`/units/${unit.id.toString()}/lessons`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Original Name',
        description: 'Original description',
      });

    const lessonId = lessonResponse.body.lesson.id;

    const response = await request(app.getHttpServer())
      .patch(`/lessons/${lessonId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Updated Name',
        description: 'Updated description',
        isPreview: true,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.lessonId).toBe(lessonId);
  });

  test('[PATCH] /lessons/:lessonId - Lesson not found', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const response = await request(app.getHttpServer())
      .patch('/lessons/non-existent-lesson')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Updated Name',
      });

    expect(response.statusCode).toBe(400);
  });

  test('[PATCH] /lessons/:lessonId - Not the course creator', async () => {
    const owner = await accountFactory.makePrismaAccount();
    const otherUser = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: owner.id.toString() });
    const anotherAccessToken = jwt.sign({ sub: otherUser.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: owner.id,
    });

    const unit = await unitFactory.makePrismaUnit({
      courseId: course.id,
    });

    const lessonResponse = await request(app.getHttpServer())
      .post(`/units/${unit.id.toString()}/lessons`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Lesson',
      });

    const lessonId = lessonResponse.body.lesson.id;

    const response = await request(app.getHttpServer())
      .patch(`/lessons/${lessonId}`)
      .set('Authorization', `Bearer ${anotherAccessToken}`)
      .send({
        name: 'Updated Name',
      });

    expect(response.statusCode).toBe(400);
  });
});

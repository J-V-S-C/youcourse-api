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
import { LessonFactory } from 'test/factories/prisma/prisma-lesson-factory';
import { vi } from 'vitest';

describe('Delete Lesson (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accountFactory: AccountFactory;
  let courseFactory: CourseFactory;
  let unitFactory: UnitFactory;
  let lessonFactory: LessonFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AccountFactory, CourseFactory, UnitFactory, LessonFactory],
    }).compile();

    accountFactory = moduleRef.get(AccountFactory);
    courseFactory = moduleRef.get(CourseFactory);
    unitFactory = moduleRef.get(UnitFactory);
    lessonFactory = moduleRef.get(LessonFactory);
    jwt = moduleRef.get(JwtService);
    prisma = moduleRef.get(PrismaService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  test('[DELETE] /lessons/:lessonId - Success', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
    });

    const unit = await unitFactory.makePrismaUnit({
      courseId: course.id,
    });

    const lesson = await lessonFactory.makePrismaLesson({
      unitId: unit.id,
    });

    const response = await request(app.getHttpServer())
      .delete(`/lessons/${lesson.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(204);

    const deletedLesson = await prisma.lesson.findUnique({
      where: {
        id: lesson.id.toString(),
      },
    });

    expect(deletedLesson).toBeNull();
  });

  test('[DELETE] /lessons/:lessonId - Lesson not found', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const response = await request(app.getHttpServer())
      .delete('/lessons/non-existent-lesson')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
  });

  test('[DELETE] /lessons/:lessonId - Not the course creator', async () => {
    const owner = await accountFactory.makePrismaAccount();
    const otherUser = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: otherUser.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: owner.id,
    });

    const unit = await unitFactory.makePrismaUnit({
      courseId: course.id,
    });

    const lesson = await lessonFactory.makePrismaLesson({
      unitId: unit.id,
    });

    const response = await request(app.getHttpServer())
      .delete(`/lessons/${lesson.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
  });

  test('[DELETE] /lessons/:lessonId - Without auth', async () => {
    const user = await accountFactory.makePrismaAccount();

    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
    });

    const unit = await unitFactory.makePrismaUnit({
      courseId: course.id,
    });

    const lesson = await lessonFactory.makePrismaLesson({
      unitId: unit.id,
    });

    const response = await request(app.getHttpServer()).delete(
      `/lessons/${lesson.id.toString()}`,
    );

    expect(response.statusCode).toBe(401);
  });
});

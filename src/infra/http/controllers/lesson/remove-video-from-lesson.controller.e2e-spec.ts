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
import { VideoService } from 'src/domain/youcourse/application/services/video-service';

describe('Remove Video from Lesson (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accountFactory: AccountFactory;
  let courseFactory: CourseFactory;
  let unitFactory: UnitFactory;
  let lessonFactory: LessonFactory;
  let jwt: JwtService;

  const mockVideoService = {
    initiateUpload: vi.fn().mockResolvedValue({
      externalId: 'video-123',
      uploadUrl: 'https://upload.example.com/video-123',
    }),
    deleteVideo: vi.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AccountFactory, CourseFactory, UnitFactory, LessonFactory],
    })
      .overrideProvider(VideoService)
      .useValue(mockVideoService)
      .compile();

    accountFactory = moduleRef.get(AccountFactory);
    courseFactory = moduleRef.get(CourseFactory);
    unitFactory = moduleRef.get(UnitFactory);
    lessonFactory = moduleRef.get(LessonFactory);
    jwt = moduleRef.get(JwtService);
    prisma = moduleRef.get(PrismaService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  test('[DELETE] /lessons/:lessonId/video - Success', async () => {
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

    await request(app.getHttpServer())
      .post(`/lessons/${lesson.id.toString()}/video`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        filename: 'video.mp4',
        contentType: 'video/mp4',
      });

    const response = await request(app.getHttpServer())
      .delete(`/lessons/${lesson.id.toString()}/video`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.lessonId).toBe(lesson.id.toString());
  });

  test('[DELETE] /lessons/:lessonId/video - Lesson not found', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const response = await request(app.getHttpServer())
      .delete('/lessons/non-existent-lesson/video')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
  });

  test('[DELETE] /lessons/:lessonId/video - Not the course creator', async () => {
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
      .delete(`/lessons/${lesson.id.toString()}/video`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(400);
  });
});

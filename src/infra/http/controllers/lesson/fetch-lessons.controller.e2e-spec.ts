import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { UnitFactory } from 'test/factories/prisma/prisma-unit-factory';
import { LessonFactory } from 'test/factories/prisma/prisma-lesson-factory';
import { CourseFactory } from 'test/factories/prisma/prisma-course-factory';
import { Video } from 'src/domain/youcourse/enterprise/entities/value-objects/video.vo';

describe('Fetch Lessons (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accountFactory: AccountFactory;
  let unitFactory: UnitFactory;
  let lessonFactory: LessonFactory;
  let courseFactory: CourseFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AccountFactory, UnitFactory, LessonFactory, CourseFactory],
    }).compile();

    accountFactory = moduleRef.get(AccountFactory);
    unitFactory = moduleRef.get(UnitFactory);
    lessonFactory = moduleRef.get(LessonFactory);
    courseFactory = moduleRef.get(CourseFactory);
    jwt = moduleRef.get(JwtService); // Corrigido o typo: JwtSerrvice -> JwtService
    prisma = moduleRef.get(PrismaService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  test('[GET] /units/:unitId/lessons - Success', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });
    const course = await courseFactory.makePrismaCourse({ creatorId: user.id });

    const unit = await unitFactory.makePrismaUnit({
      courseId: course.id,
    });

    await lessonFactory.makePrismaLesson({
      unitId: unit.id,
      name: 'Lesson 1',
      position: 0,
    });

    await lessonFactory.makePrismaLesson({
      unitId: unit.id,
      name: 'Lesson 2',
      position: 1,
    });

    const response = await request(app.getHttpServer())
      .get(`/units/${unit.id.toString()}/lessons`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.lessons).toHaveLength(2);
    expect(response.body.lessons[0].name).toBe('Lesson 1');
    expect(response.body.lessons[1].name).toBe('Lesson 2');
  });

  test('[GET] /units/:unitId/lessons - Empty unit', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });
    const course = await courseFactory.makePrismaCourse({ creatorId: user.id });

    const unit = await unitFactory.makePrismaUnit({
      courseId: course.id,
    });

    const response = await request(app.getHttpServer())
      .get(`/units/${unit.id.toString()}/lessons`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.lessons).toHaveLength(0);
  });

  test('[GET] /units/:unitId/lessons - Lessons sorted by position', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });
    const course = await courseFactory.makePrismaCourse({ creatorId: user.id });

    const unit = await unitFactory.makePrismaUnit({
      courseId: course.id,
    });

    await lessonFactory.makePrismaLesson({
      unitId: unit.id,
      name: 'Lesson B',
      position: 1,
    });

    await lessonFactory.makePrismaLesson({
      unitId: unit.id,
      name: 'Lesson A',
      position: 0,
    });

    const response = await request(app.getHttpServer())
      .get(`/units/${unit.id.toString()}/lessons`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.lessons[0].name).toBe('Lesson A');
    expect(response.body.lessons[1].name).toBe('Lesson B');
  });

  test('[GET] /units/:unitId/lessons - Prevent bypass for non-creator', async () => {
    const creator = await accountFactory.makePrismaAccount();
    const otherUser = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: otherUser.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: creator.id,
    });
    const unit = await unitFactory.makePrismaUnit({ courseId: course.id });

    // Instanciação correta do Value Object
    const mockVideo = Video.createReady({
      externalId: '123',
      playbackUrl: 'https://example.com/video.m3u8',
    });

    await lessonFactory.makePrismaLesson({
      unitId: unit.id,
      name: 'Preview Lesson',
      isPreview: true,
      position: 0,
      video: mockVideo, // Sem "as any"
    });

    await lessonFactory.makePrismaLesson({
      unitId: unit.id,
      name: 'Locked Lesson',
      isPreview: false,
      position: 1,
      video: mockVideo, // Sem "as any"
    });

    const response = await request(app.getHttpServer())
      .get(`/units/${unit.id.toString()}/lessons`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.lessons[0].video).not.toBeNull();
    expect(response.body.lessons[1].video).toBeNull();
  });

  test('[GET] /units/:unitId/lessons - Allow full access for creator', async () => {
    const creator = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: creator.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: creator.id,
    });
    const unit = await unitFactory.makePrismaUnit({ courseId: course.id });

    const mockVideo = Video.createReady({
      externalId: '123',
      playbackUrl: 'https://example.com/video.m3u8',
    });

    await lessonFactory.makePrismaLesson({
      unitId: unit.id,
      name: 'Locked Lesson',
      isPreview: false,
      video: mockVideo,
    });

    const response = await request(app.getHttpServer())
      .get(`/units/${unit.id.toString()}/lessons`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.lessons[0].video).not.toBeNull();
    expect(response.body.lessons[0].video.playbackUrl).toBe(
      'https://example.com/video.m3u8',
    );
  });

  test('[GET] /units/:unitId/lessons - Prevent bypass for unauthenticated user', async () => {
    const creator = await accountFactory.makePrismaAccount();
    const course = await courseFactory.makePrismaCourse({
      creatorId: creator.id,
    });
    const unit = await unitFactory.makePrismaUnit({ courseId: course.id });

    const mockVideo = Video.createReady({
      externalId: '123',
      playbackUrl: 'https://example.com/video.m3u8',
    });

    await lessonFactory.makePrismaLesson({
      unitId: unit.id,
      name: 'Locked Lesson',
      isPreview: false,
      video: mockVideo,
    });

    const response = await request(app.getHttpServer()).get(
      `/units/${unit.id.toString()}/lessons`,
    );

    expect(response.statusCode).toBe(401);
  });
});

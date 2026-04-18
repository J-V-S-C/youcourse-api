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

describe('Create Lesson (E2E)', () => {
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

  test('[POST] /units/:unitId/lessons - Success', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
    });

    const unit = await unitFactory.makePrismaUnit({
      courseId: course.id,
    });

    const response = await request(app.getHttpServer())
      .post(`/units/${unit.id.toString()}/lessons`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Introduction Lesson',
        description: 'Learn the basics',
        isPreview: true,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.lesson).toHaveProperty('id');
    expect(response.body.lesson.name).toBe('Introduction Lesson');
    expect(response.body.lesson.description).toBe('Learn the basics');
    expect(response.body.lesson.isPreview).toBe(true);
  });

  test('[POST] /units/:unitId/lessons - With position', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
    });

    const unit = await unitFactory.makePrismaUnit({
      courseId: course.id,
    });

    const response = await request(app.getHttpServer())
      .post(`/units/${unit.id.toString()}/lessons`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Positioned Lesson',
        position: 5,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.lesson.position).toBe(5);
  });

  test('[POST] /units/:unitId/lessons - Unit not found', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const response = await request(app.getHttpServer())
      .post('/units/non-existent-unit/lessons')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Lesson',
      });

    expect(response.statusCode).toBe(400);
  });

  test('[POST] /units/:unitId/lessons - Not the course creator', async () => {
    const owner = await accountFactory.makePrismaAccount();
    const otherUser = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: otherUser.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: owner.id,
    });

    const unit = await unitFactory.makePrismaUnit({
      courseId: course.id,
    });

    const response = await request(app.getHttpServer())
      .post(`/units/${unit.id.toString()}/lessons`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Lesson',
      });

    expect(response.statusCode).toBe(400);
  });

  test('[POST] /units/:unitId/lessons - Without auth', async () => {
    const user = await accountFactory.makePrismaAccount();

    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
    });

    const unit = await unitFactory.makePrismaUnit({
      courseId: course.id,
    });

    const response = await request(app.getHttpServer())
      .post(`/units/${unit.id.toString()}/lessons`)
      .send({
        name: 'Lesson',
      });

    expect(response.statusCode).toBe(401);
  });

  test('[POST] /units/:unitId/lessons - Invalid name (too long)', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
    });

    const unit = await unitFactory.makePrismaUnit({
      courseId: course.id,
    });

    const response = await request(app.getHttpServer())
      .post(`/units/${unit.id.toString()}/lessons`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'a'.repeat(101),
      });

    expect(response.statusCode).toBe(400);
  });
});

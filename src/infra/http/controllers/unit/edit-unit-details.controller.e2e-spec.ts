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

describe('Edit Unit Details (E2E)', () => {
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

  test('[PATCH] /units/:unitId - Success', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
    });

    const unit = await unitFactory.makePrismaUnit({
      courseId: course.id,
    });

    const response = await request(app.getHttpServer())
      .patch(`/units/${unit.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Updated Unit Name',
        description: 'Updated description',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.unitId).toBe(unit.id.toString());
  });

  test('[PATCH] /units/:unitId - Unit not found', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const response = await request(app.getHttpServer())
      .patch('/units/non-existent-unit')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Updated Name',
      });

    expect(response.statusCode).toBe(400);
  });

  test('[PATCH] /units/:unitId - Not the course creator', async () => {
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
      .patch(`/units/${unit.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Updated Name',
      });

    expect(response.statusCode).toBe(400);
  });

  test('[PATCH] /units/:unitId - Without auth', async () => {
    const user = await accountFactory.makePrismaAccount();

    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
    });

    const unit = await unitFactory.makePrismaUnit({
      courseId: course.id,
    });

    const response = await request(app.getHttpServer())
      .patch(`/units/${unit.id.toString()}`)
      .send({
        name: 'Updated Name',
      });

    expect(response.statusCode).toBe(401);
  });
});

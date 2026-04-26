import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { CourseFactory } from 'test/factories/prisma/prisma-course-factory';
import { EmailService } from 'src/domain/youcourse/application/services/email-service';
import { vi } from 'vitest';

describe('Publish Course (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accountFactory: AccountFactory;
  let courseFactory: CourseFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AccountFactory, CourseFactory],
    })
      .overrideProvider(EmailService)
      .useValue({ sendMail: vi.fn() })
      .compile();

    accountFactory = moduleRef.get(AccountFactory);
    courseFactory = moduleRef.get(CourseFactory);
    jwt = moduleRef.get(JwtService);
    prisma = moduleRef.get(PrismaService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  test('[PATCH] /courses/:courseId/publish - Success', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
      visible: false,
    });

    const response = await request(app.getHttpServer())
      .patch(`/courses/${course.id.toString()}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        price: {
          amount: 150,
          currency: 'BRL',
        },
      });

    expect(response.statusCode).toBe(204);

    const publishedCourse = await prisma.course.findUnique({
      where: {
        id: course.id.toString(),
      },
    });

    expect(publishedCourse?.visible).toBe(true);
  });

  test('[PATCH] /courses/:courseId/publish - Not Allowed (Different user)', async () => {
    const originalOwner = await accountFactory.makePrismaAccount();
    const otherUser = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: otherUser.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: originalOwner.id,
      visible: false,
    });

    const response = await request(app.getHttpServer())
      .patch(`/courses/${course.id.toString()}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        price: {
          amount: 150,
          currency: 'BRL',
        },
      });

    expect(response.statusCode).toBe(400); // ResourceNotFound maps to BadRequest generally, or NotAllowed maps to 403, we check 400 for errors in the current setup.
  });
});

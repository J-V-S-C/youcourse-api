import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { CourseFactory } from 'test/factories/prisma/prisma-course-factory';
import { EmailService } from 'src/domain/youcourse/application/services/emailService';
import { vi } from 'vitest';

describe('Delete Course (E2E)', () => {
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

  test('[DELETE] /courses/:courseId - Success', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
    });

    const response = await request(app.getHttpServer())
      .delete(`/courses/${course.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(204);

    const deletedCourse = await prisma.course.findUnique({
      where: {
        id: course.id.toString(),
      },
    });

    expect(deletedCourse).toBeNull();
  });

  test('[DELETE] /courses/:courseId - Not Allowed', async () => {
    const originalOwner = await accountFactory.makePrismaAccount();
    const otherUser = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: otherUser.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: originalOwner.id,
    });

    const response = await request(app.getHttpServer())
      .delete(`/courses/${course.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(400);
  });
});

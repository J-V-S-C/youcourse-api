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

describe('Edit Course Details (E2E)', () => {
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

  test('[PUT] /courses/:courseId - Success', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
      name: 'Old Name',
      description: 'Old Description',
    });

    const response = await request(app.getHttpServer())
      .put(`/courses/${course.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'New Mod Name',
        description: 'New Mod Description',
      });

    if (response.statusCode === 400) {
      console.log('EDIT COURSE DETAILS 400 ERROR:', JSON.stringify(response.body, null, 2));
    }
    expect(response.statusCode).toBe(204);

    const updatedCourse = await prisma.course.findUnique({
      where: {
        id: course.id.toString(),
      },
    });

    expect(updatedCourse?.name).toBe('New Mod Name');
    expect(updatedCourse?.description).toBe('New Mod Description');
  });

  test('[PUT] /courses/:courseId - Not Allowed', async () => {
    const originalOwner = await accountFactory.makePrismaAccount();
    const otherUser = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: otherUser.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: originalOwner.id,
      name: 'Old Name',
      description: 'Old Description',
    });

    const response = await request(app.getHttpServer())
      .put(`/courses/${course.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'New Mod Name',
        description: 'New Mod Description',
      });

    expect(response.statusCode).toBe(400);
  });
});

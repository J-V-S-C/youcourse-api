import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { CourseFactory } from 'test/factories/prisma/prisma-course-factory';
import { RatingFactory } from 'test/factories/prisma/prisma-rating-factory';
import { Stars } from 'src/domain/youcourse/enterprise/entities/value-objects/stars';
import { EmailService } from 'src/domain/youcourse/application/services/emailService';
import { vi } from 'vitest';

describe('Edit Rating (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accountFactory: AccountFactory;
  let courseFactory: CourseFactory;
  let ratingFactory: RatingFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AccountFactory, CourseFactory, RatingFactory],
    })
      .overrideProvider(EmailService)
      .useValue({ sendMail: vi.fn() })
      .compile();

    accountFactory = moduleRef.get(AccountFactory);
    courseFactory = moduleRef.get(CourseFactory);
    ratingFactory = moduleRef.get(RatingFactory);
    jwt = moduleRef.get(JwtService);
    prisma = moduleRef.get(PrismaService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  test('[PUT] /ratings/:ratingId - Success', async () => {
    const user = await accountFactory.makePrismaAccount();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const course = await courseFactory.makePrismaCourse({
      creatorId: user.id,
    });

    const rating = await ratingFactory.makePrismaRating({
      creatorId: user.id,
      courseId: course.id,
      stars: Stars.create(4),
      commentary: 'Good course',
    });

    const response = await request(app.getHttpServer())
      .put(`/ratings/${rating.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        commentary: 'Excellent course after the update!',
        stars: 5,
      });

    expect(response.statusCode).toBe(204);

    const updatedRating = await prisma.rating.findUnique({
      where: {
        id: rating.id.toString(),
      },
    });

    expect(updatedRating?.stars).toBe(5);
    expect(updatedRating?.commentary).toBe(
      'Excellent course after the update!',
    );
  });
});

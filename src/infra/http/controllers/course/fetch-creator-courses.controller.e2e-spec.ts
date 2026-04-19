import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import request from 'supertest';
import { AccountFactory } from 'test/factories/prisma/prisma-account-factory';
import { CourseFactory } from 'test/factories/prisma/prisma-course-factory';
import { JwtService } from '@nestjs/jwt';

describe('Fetch Managed Courses (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accountFactory: AccountFactory;
  let courseFactory: CourseFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AccountFactory, CourseFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    accountFactory = moduleRef.get(AccountFactory);
    courseFactory = moduleRef.get(CourseFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test('[GET] /courses/managed', async () => {
    // 1. Criar dois usuários distintos
    const user = await accountFactory.makePrismaAccount();
    const otherUser = await accountFactory.makePrismaAccount();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    // 2. Criar cursos para o usuário autenticado (incluindo um oculto)
    await Promise.all([
      courseFactory.makePrismaCourse({
        creatorId: user.id,
        name: 'My Public Course',
        visible: true,
      }),
      courseFactory.makePrismaCourse({
        creatorId: user.id,
        name: 'My Hidden Course',
        visible: false,
      }),
    ]);

    // 3. Criar curso de outro usuário (não deve aparecer)
    await courseFactory.makePrismaCourse({
      creatorId: otherUser.id,
      name: 'Other Instructor Course',
      visible: true,
    });

    const response = await request(app.getHttpServer())
      .get('/courses/managed')
      .set('Authorization', `Bearer ${accessToken}`); // Injeção do Token

    expect(response.statusCode).toBe(200);

    // Deve retornar apenas os 2 cursos do instrutor logado
    expect(response.body.courses).toHaveLength(2);
    expect(response.body.courses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'My Public Course' }),
        expect.objectContaining({ name: 'My Hidden Course' }),
      ]),
    );

    // Garante que o curso do "outro usuário" não vazou
    const containsOtherCourse = response.body.courses.some(
      (c: any) => c.name === 'Other Instructor Course',
    );
    expect(containsOtherCourse).toBe(false);
  });

  test('[GET] /courses/managed (Unauthorized)', async () => {
    // Tenta acessar sem o token Bearer
    const response = await request(app.getHttpServer()).get('/courses/managed');

    expect(response.statusCode).toBe(401);
  });
});

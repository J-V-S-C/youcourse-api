import { config } from 'dotenv';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { AppModule } from 'src/infra/app.module';
import { EmailService } from 'src/domain/youcourse/application/services/emailService';
import { vi } from 'vitest';

config({ path: '.env', override: true });
config({ path: '.env.test', override: true });

let app: INestApplication;
let prisma: PrismaService;

beforeAll(async () => {
  try {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
  } catch (err) {
    console.error('FATAL SETUP ERROR:', err);
    throw err;
  }
});

beforeEach(async () => {
  const tables = await prisma.$queryRaw<
    { tablename: string }[]
  >`SELECT tablename FROM pg_tables WHERE schemaname = 'public';`;

  const tableNames = tables.map((t) => `"${t.tablename}"`).join(', ');

  if (tableNames.length > 0) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} CASCADE;`);
  }
});

afterAll(async () => {
  await app.close();
});

import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { EnvService } from 'src/infra/env/env.service';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly configService: EnvService) {
    const connectionString = configService.get('DATABASE_URL');
    const adapter = new PrismaPg({ connectionString });

    super({
      adapter,
      log: ['warn', 'error'],
    });
  }

  onModuleInit() {
    return this.$connect();
  }

  onModuleDestroy() {
    return this.$disconnect();
  }
}

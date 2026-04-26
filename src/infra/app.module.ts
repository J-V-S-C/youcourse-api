import { Module } from '@nestjs/common';
import { HttpModule } from './http/http.module';
import { AuthModule } from './auth/auth.module';
import { EnvModule } from './env/env.module';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env/env';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 15 * 60 * 1000, //15 minutes * 60 seconds * 1000 ms
          limit: 5,
        },
      ],
    }),
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    HttpModule,
    AuthModule,
    EnvModule,
  ],
})
export class AppModule {}

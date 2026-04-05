import { Module } from '@nestjs/common';
import { Encrypter } from 'src/domain/youcourse/application/cryptography/encrypter';
import { HashComparer } from 'src/domain/youcourse/application/cryptography/hash-comparer';
import { BcryptHasher } from './bcrypt-hasher';
import { HashGenerator } from 'src/domain/youcourse/application/cryptography/hash-generator';
import { TokenGenerator } from 'src/domain/youcourse/application/cryptography/token-generator';
import { UUIDTokenGenerator } from './uuid-token-generator';
import { JwtEncrypter } from './jwt-encrypter';

@Module({
  providers: [
    {
      provide: Encrypter,
      useClass: JwtEncrypter,
    },
    {
      provide: HashComparer,
      useClass: BcryptHasher,
    },
    {
      provide: HashGenerator,
      useClass: BcryptHasher,
    },
    {
      provide: TokenGenerator,
      useClass: UUIDTokenGenerator,
    },
  ],
  exports: [Encrypter, HashComparer, HashGenerator, TokenGenerator],
})
export class CryptographyModule {}

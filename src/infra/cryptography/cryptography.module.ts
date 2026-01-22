import { Module } from "@nestjs/common";
import { Encrypter } from "src/domain/e-commerce/application/cryptography/encrypter";
import { HashComparer } from "src/domain/e-commerce/application/cryptography/hash-comparer";
import { BcryptHasher } from "./bcrypt-hasher";
import { HashGenerator } from "src/domain/e-commerce/application/cryptography/hash-generator";
//import { JwtEncrypter } from "./jwt-encrypter";
import { JwtEncrypter } from "./jwt-encrypter";

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
  ],
  exports: [
    Encrypter, HashComparer, HashGenerator
  ]
})
export class CryptographyModule { }
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CreateAccountController } from './controllers/create-account.controller';
import { RegisterAccountUseCase } from 'src/domain/e-commerce/application/use-cases/register-account';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { AuthenticateAccountController } from './controllers/authenticate-account.controller';
import { AuthenticateAccountUseCase } from 'src/domain/e-commerce/application/use-cases/authenticate-account';
import { CreateProductController } from './controllers/create-product.controller';
import { CreateProductUseCase } from 'src/domain/e-commerce/application/use-cases/create-product';

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    CreateAccountController,
    AuthenticateAccountController,
    CreateProductController,
  ],
  providers: [
    RegisterAccountUseCase,
    AuthenticateAccountUseCase,
    CreateProductUseCase,
  ],
})
export class HttpModule {}

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CreateAccountController } from './controllers/create-account.controller';
import { RegisterAccountUseCase } from 'src/domain/ecommerce/application/use-cases/register-account';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { AuthenticateAccountController } from './controllers/authenticate-account.controller';
import { AuthenticateAccountUseCase } from 'src/domain/ecommerce/application/use-cases/authenticate-account';
import { CreateProductController } from './controllers/create-product.controller';
import { CreateProductUseCase } from 'src/domain/ecommerce/application/use-cases/create-product';
import { FetchProductsController } from './controllers/fetch-products.controller';
import { FetchProductsUseCase } from 'src/domain/ecommerce/application/use-cases/fetch-products';
import { RateProductController } from './controllers/rate-product.controller';
import { RateProductUseCase } from 'src/domain/ecommerce/application/use-cases/rate-product';

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    CreateAccountController,
    AuthenticateAccountController,
    CreateProductController,
    FetchProductsController,
    RateProductController,
  ],
  providers: [
    RegisterAccountUseCase,
    AuthenticateAccountUseCase,
    CreateProductUseCase,
    FetchProductsUseCase,
    RateProductUseCase,
  ],
})
export class HttpModule {}

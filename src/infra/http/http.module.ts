import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CreateAccountController } from './controllers/create-account.controller';
import { RegisterAccountUseCase } from 'src/domain/ecommerce/application/use-cases/register-account';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { AuthenticateAccountController } from './controllers/authenticate-account.controller';
import { AuthenticateAccountUseCase } from 'src/domain/ecommerce/application/use-cases/authenticate-account';
import { CreateCourseController } from './controllers/create-course.controller';
import { CreateCourseUseCase } from 'src/domain/ecommerce/application/use-cases/create-course';
import { FetchCoursesController } from './controllers/fetch-courses.controller';
import { FetchCoursesUseCase } from 'src/domain/ecommerce/application/use-cases/fetch-courses';
import { RateCourseController } from './controllers/rate-course.controller';
import { RateCourseUseCase } from 'src/domain/ecommerce/application/use-cases/rate-course';
import { GetAccountByIdController } from './controllers/get-account-by-id.controller';
import { GetAccountByIdUseCase } from 'src/domain/ecommerce/application/use-cases/get-account-by-id';
import { EditAccountDetailsController } from './controllers/edit-account-details.controller';
import { EditAccountDetailsUseCase } from 'src/domain/ecommerce/application/use-cases/edit-account-details';

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    CreateAccountController,
    AuthenticateAccountController,
    CreateCourseController,
    FetchCoursesController,
    RateCourseController,
    GetAccountByIdController,
    EditAccountDetailsController,
  ],
  providers: [
    RegisterAccountUseCase,
    AuthenticateAccountUseCase,
    CreateCourseUseCase,
    FetchCoursesUseCase,
    RateCourseUseCase,
    GetAccountByIdUseCase,
    EditAccountDetailsUseCase,
  ],
})
export class HttpModule {}

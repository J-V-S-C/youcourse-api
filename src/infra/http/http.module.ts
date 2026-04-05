import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ServicesModule } from '../services/services.module';
import { CreateAccountController } from './controllers/create-account.controller';
import { RegisterAccountUseCase } from 'src/domain/youcourse/application/use-cases/auth/register-account';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { AuthenticateAccountController } from './controllers/authenticate-account.controller';
import { AuthenticateAccountUseCase } from 'src/domain/youcourse/application/use-cases/auth/authenticate-account';
import { CreateCourseController } from './controllers/create-course.controller';
import { CreateCourseUseCase } from 'src/domain/youcourse/application/use-cases/course/create-course';
import { FetchCoursesController } from './controllers/fetch-courses.controller';
import { FetchCoursesUseCase } from 'src/domain/youcourse/application/use-cases/course/fetch-courses';
import { RateCourseController } from './controllers/rate-course.controller';
import { RateCourseUseCase } from 'src/domain/youcourse/application/use-cases/ratings/rate-course';
import { GetAccountByIdController } from './controllers/get-account-by-id.controller';
import { GetAccountByIdUseCase } from 'src/domain/youcourse/application/use-cases/account/get-account-by-id';
import { EditAccountDetailsController } from './controllers/edit-account-details.controller';
import { EditAccountDetailsUseCase } from 'src/domain/youcourse/application/use-cases/account/edit-account-details';

import { EditPasswordController } from './controllers/edit-password.controller';
import { EditPasswordUseCase } from 'src/domain/youcourse/application/use-cases/account/edit-password';
import { RequestPasswordResetController } from './controllers/request-password-reset.controller';
import { RequestPasswordResetUseCase } from 'src/domain/youcourse/application/use-cases/account/request-password-reset';

import { RefreshTokenController } from './controllers/refresh-token.controller';
import { RefreshTokenUseCase } from 'src/domain/youcourse/application/use-cases/auth/refresh-token';

import { DeleteCourseController } from './controllers/delete-course.controller';
import { DeleteCourseUseCase } from 'src/domain/youcourse/application/use-cases/course/delete-course';
import { EditCourseDetailsController } from './controllers/edit-course-details.controller';
import { EditCourseDetailsUseCase } from 'src/domain/youcourse/application/use-cases/course/edit-course-details';
import { HideCourseController } from './controllers/hide-course.controller';
import { HideCourseUseCase } from 'src/domain/youcourse/application/use-cases/course/hide-course';
import { PublishCourseController } from './controllers/publish-course.controller';
import { PublishCourseUseCase } from 'src/domain/youcourse/application/use-cases/course/publish-course';
import { UnpublishCourseController } from './controllers/unpublish-course.controller';
import { UnpublishCourseUseCase } from 'src/domain/youcourse/application/use-cases/course/unpublish-course';
import { UpdateCoursePriceController } from './controllers/update-course-price.controller';
import { UpdateCoursePriceUseCase } from 'src/domain/youcourse/application/use-cases/course/update-course-price';

import { EditRatingController } from './controllers/edit-rating.controller';
import { EditRatingUseCase } from 'src/domain/youcourse/application/use-cases/ratings/edit-rating';

@Module({
  imports: [DatabaseModule, ServicesModule, CryptographyModule],
  controllers: [
    CreateAccountController,
    AuthenticateAccountController,
    CreateCourseController,
    FetchCoursesController,
    RateCourseController,
    GetAccountByIdController,
    EditAccountDetailsController,
    EditPasswordController,
    RequestPasswordResetController,
    RefreshTokenController,
    DeleteCourseController,
    EditCourseDetailsController,
    HideCourseController,
    PublishCourseController,
    UnpublishCourseController,
    UpdateCoursePriceController,
    EditRatingController,
  ],
  providers: [
    RegisterAccountUseCase,
    AuthenticateAccountUseCase,
    CreateCourseUseCase,
    FetchCoursesUseCase,
    RateCourseUseCase,
    GetAccountByIdUseCase,
    EditAccountDetailsUseCase,
    EditPasswordUseCase,
    RequestPasswordResetUseCase,
    RefreshTokenUseCase,
    DeleteCourseUseCase,
    EditCourseDetailsUseCase,
    HideCourseUseCase,
    PublishCourseUseCase,
    UnpublishCourseUseCase,
    UpdateCoursePriceUseCase,
    EditRatingUseCase,
  ],
})
export class HttpModule {}

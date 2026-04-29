import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ServicesModule } from '../services/services.module';
import { CryptographyModule } from '../cryptography/cryptography.module';

// Controllers
import { CreateAccountController } from './controllers/auth/create-account.controller';
import { AuthenticateAccountController } from './controllers/auth/authenticate-account.controller';
import { CreateCourseController } from './controllers/course/create-course.controller';
import { FetchCoursesController } from './controllers/course/fetch-courses.controller';
import { GetAccountByIdController } from './controllers/account/get-account-by-id.controller';
import { EditAccountDetailsController } from './controllers/account/edit-account-details.controller';
import { RefreshTokenController } from './controllers/auth/refresh-token.controller';
import { DeleteCourseController } from './controllers/course/delete-course.controller';
import { EditCourseDetailsController } from './controllers/course/edit-course-details.controller';
import { HideCourseController } from './controllers/course/hide-course.controller';
import { PublishCourseController } from './controllers/course/publish-course.controller';
import { UnpublishCourseController } from './controllers/course/unpublish-course.controller';
import { UpdateCoursePriceController } from './controllers/course/update-course-price.controller';

// Lesson Controllers
import { CreateLessonController } from './controllers/lesson/create-lesson.controller';
import { EditLessonDetailsController } from './controllers/lesson/edit-lesson-details.controller';
import { DeleteLessonController } from './controllers/lesson/delete-lesson.controller';
import { AttachVideoToLessonController } from './controllers/lesson/attach-video-to-lesson.controller';
import { RemoveVideoFromLessonController } from './controllers/lesson/remove-video-from-lesson.controller';
import { ReorderLessonController } from './controllers/lesson/reorder-lesson.controller';

// Unit Controllers
import { CreateUnitController } from './controllers/unit/create-unit.controller';
import { EditUnitDetailsController } from './controllers/unit/edit-unit-details.controller';
import { DeleteUnitController } from './controllers/unit/delete-unit.controller';
import { FetchUnitsController } from './controllers/unit/fetch-units.controller';
import { ReorderUnitController } from './controllers/unit/reorder-unit.controller';

// Use Cases
import { RegisterAccountUseCase } from 'src/domain/youcourse/application/use-cases/auth/register-account';
import { AuthenticateAccountUseCase } from 'src/domain/youcourse/application/use-cases/auth/authenticate-account';
import { CreateCourseUseCase } from 'src/domain/youcourse/application/use-cases/course/create-course';
import { FetchCoursesUseCase } from 'src/domain/youcourse/application/use-cases/course/fetch-courses';
import { RefreshTokenUseCase } from 'src/domain/youcourse/application/use-cases/auth/refresh-token';
import { DeleteCourseUseCase } from 'src/domain/youcourse/application/use-cases/course/delete-course';
import { EditCourseDetailsUseCase } from 'src/domain/youcourse/application/use-cases/course/edit-course-details';
import { HideCourseUseCase } from 'src/domain/youcourse/application/use-cases/course/hide-course';
import { PublishCourseUseCase } from 'src/domain/youcourse/application/use-cases/course/publish-course';
import { UnpublishCourseUseCase } from 'src/domain/youcourse/application/use-cases/course/unpublish-course';
import { UpdateCoursePriceUseCase } from 'src/domain/youcourse/application/use-cases/course/update-course-price';

// Lesson Use Cases
import { CreateLessonUseCase } from 'src/domain/youcourse/application/use-cases/lesson/create-lesson';
import { EditLessonDetailsUseCase } from 'src/domain/youcourse/application/use-cases/lesson/edit-lesson-details';
import { DeleteLessonUseCase } from 'src/domain/youcourse/application/use-cases/lesson/delete-lesson';
import { AttachVideoToLessonUseCase } from 'src/domain/youcourse/application/use-cases/lesson/attach-video-to-lesson';
import { RemoveVideoFromLessonUseCase } from 'src/domain/youcourse/application/use-cases/lesson/remove-video-from-lesson';
import { ReorderLessonUseCase } from 'src/domain/youcourse/application/use-cases/lesson/reorder-lesson';

// Unit Use Cases
import { CreateUnitUseCase } from 'src/domain/youcourse/application/use-cases/unit/create-unit';
import { EditUnitDetailsUseCase } from 'src/domain/youcourse/application/use-cases/unit/edit-unit-details';
import { DeleteUnitUseCase } from 'src/domain/youcourse/application/use-cases/unit/delete-unit';
import { FetchUnitsUseCase } from 'src/domain/youcourse/application/use-cases/unit/fetch-units';
import { ReorderUnitUseCase } from 'src/domain/youcourse/application/use-cases/unit/reorder-unit';

import { RateCourseController } from './controllers/ratings/rate-course.controller';
import { EditPasswordController } from './controllers/account/edit-password.controller';
import { RequestPasswordResetController } from './controllers/account/request-password-reset.controller';
import { EditRatingController } from './controllers/ratings/edit-rating.controller';
import { RateCourseUseCase } from 'src/domain/youcourse/application/use-cases/ratings/rate-course';
import { GetAccountByIdUseCase } from 'src/domain/youcourse/application/use-cases/account/get-account-by-id';
import { EditAccountDetailsUseCase } from 'src/domain/youcourse/application/use-cases/account/edit-account-details';
import { EditPasswordUseCase } from 'src/domain/youcourse/application/use-cases/account/edit-password';
import { RequestPasswordResetUseCase } from 'src/domain/youcourse/application/use-cases/account/request-password-reset';
import { EditRatingUseCase } from 'src/domain/youcourse/application/use-cases/ratings/edit-rating';
import { FetchLessonsUseCase } from 'src/domain/youcourse/application/use-cases/lesson/fetch-lessons';
import { FetchLessonsController } from './controllers/lesson/fetch-lessons.controller';
import { FetchCreatorCoursesController } from './controllers/course/fetch-creator-courses.controller';
import { FetchCreatorCoursesUseCase } from 'src/domain/youcourse/application/use-cases/course/fetch-creator-courses';
import { GetManagedCourseController } from './controllers/course/get-managed-course.controller';
import { GetPublicCourseController } from './controllers/course/get-public-course.controller';
import { GetCourseByIdUseCase } from 'src/domain/youcourse/application/use-cases/course/get-course-by-id';
import { PurchaseCourseController } from './controllers/course/purchase-course.controller';
import { PaymentWebhookController } from './controllers/course/payment-webhook.controller';
import { PurchaseCourseUseCase } from 'src/domain/youcourse/application/use-cases/course/purchase-course';
import { ProcessPaymentWebhookUseCase } from 'src/domain/youcourse/application/use-cases/course/process-payment-webhook';

@Module({
  imports: [DatabaseModule, ServicesModule, CryptographyModule],
  controllers: [
    CreateAccountController,
    AuthenticateAccountController,

    CreateCourseController,
    FetchCoursesController,
    FetchCreatorCoursesController,
    GetPublicCourseController,
    GetManagedCourseController,

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
    PurchaseCourseController,
    PaymentWebhookController,
    EditRatingController,

    // Lesson Controllers
    CreateLessonController,
    EditLessonDetailsController,
    DeleteLessonController,
    AttachVideoToLessonController,
    RemoveVideoFromLessonController,
    ReorderLessonController,
    FetchLessonsController,
    // Unit Controllers
    CreateUnitController,
    EditUnitDetailsController,
    DeleteUnitController,
    FetchUnitsController,
    ReorderUnitController,
  ],
  providers: [
    RegisterAccountUseCase,
    AuthenticateAccountUseCase,

    CreateCourseUseCase,
    FetchCoursesUseCase,
    FetchCreatorCoursesUseCase,
    GetCourseByIdUseCase,

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
    PurchaseCourseUseCase,
    ProcessPaymentWebhookUseCase,
    EditRatingUseCase,
    // Lesson Use Cases
    CreateLessonUseCase,
    EditLessonDetailsUseCase,
    DeleteLessonUseCase,
    AttachVideoToLessonUseCase,
    RemoveVideoFromLessonUseCase,
    ReorderLessonUseCase,
    FetchLessonsUseCase,
    // Unit Use Cases
    CreateUnitUseCase,
    EditUnitDetailsUseCase,
    DeleteUnitUseCase,
    FetchUnitsUseCase,
    ReorderUnitUseCase,
  ],
})
export class HttpModule {}

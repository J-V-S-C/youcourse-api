import { Injectable } from '@nestjs/common';
import { CoursesRepository } from '../../repositories/courses-repository';
import { AccountsRepository } from '../../repositories/accounts-repository';
import { PaymentGateway } from '../../services/payment-gateway';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { Either, left, right } from 'src/core/either';
import { PaymentsRepository } from '../../repositories/payments-repository';
import { Payment } from 'src/domain/youcourse/enterprise/entities/payment';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';

interface PurchaseCourseUseCaseRequest {
  accountId: string;
  courseId: string;
}

type PurchaseCourseUseCaseResponse = Either<
  ResourceNotFoundError,
  { paymentUrl: string }
>;

@Injectable()
export class PurchaseCourseUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private accountsRepository: AccountsRepository,
    private paymentsRepository: PaymentsRepository,
    private paymentGateway: PaymentGateway,
  ) {}

  async execute({
    accountId,
    courseId,
  }: PurchaseCourseUseCaseRequest): Promise<PurchaseCourseUseCaseResponse> {
    const course = await this.coursesRepository.findById(courseId);
    if (!course || !course.sellable || !course.price)
      return left(new ResourceNotFoundError());

    const account = await this.accountsRepository.findById(accountId);
    if (!account) return left(new ResourceNotFoundError());

    const amountInCents = course.price.amount;

    if (amountInCents === 0) {
      const payment = Payment.create({
        courseId: new UniqueEntityID(courseId),
        accountId: new UniqueEntityID(accountId),
        amount: 0,
        status: 'PAID',
      });
      await this.paymentsRepository.create(payment);

      return right({ paymentUrl: 'FREE_ENROLLMENT' });
    }

    const payment = Payment.create({
      courseId: new UniqueEntityID(courseId),
      accountId: new UniqueEntityID(accountId),
      amount: amountInCents,
    });

    await this.paymentsRepository.create(payment);
    const creator = await this.accountsRepository.findById(course.creatorId.toString());

    const { paymentUrl } = await this.paymentGateway.createCheckoutLink({
      orderId: payment.id.toString(),
      amount: amountInCents,
      courseName: course.name,
      targetHandle: creator?.paymentHandle || undefined,
      redirectUrl: `${process.env.FRONTEND_URL}/my-courses/${course.id.toString()}`,
      customer: {
        name: account.name,
        email: account.email,
      },
    });

    payment.setPaymentUrl(paymentUrl);
    await this.paymentsRepository.save(payment);

    return right({ paymentUrl });
  }
}

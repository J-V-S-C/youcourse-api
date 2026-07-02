import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { PaymentsRepository } from '../../repositories/payments-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { PaymentAmountMismatchError } from '../errors/payment-amount-mismatch-error';
import { EnrollmentsRepository } from '../../repositories/enrollments-repository';
import { Enrollment } from 'src/domain/youcourse/enterprise/entities/enrollment';

interface ProcessPaymentWebhookUseCaseRequest {
  orderNsu: string;
  transactionNsu: string;
  amount: number;
}

type ProcessPaymentWebhookUseCaseResponse = Either<
  ResourceNotFoundError | PaymentAmountMismatchError,
  { success: boolean }
>;

@Injectable()
export class ProcessPaymentWebhookUseCase {
  constructor(
    private paymentsRepository: PaymentsRepository,
    private enrollmentsRepository: EnrollmentsRepository,
  ) { }

  async execute({
    orderNsu,
    transactionNsu,
    amount,
  }: ProcessPaymentWebhookUseCaseRequest): Promise<ProcessPaymentWebhookUseCaseResponse> {
    const payment = await this.paymentsRepository.findById(orderNsu);

    if (!payment) {
      return left(new ResourceNotFoundError());
    }

    if (payment.status === 'PAID') {
      return right({ success: true });
    }

    if (payment.amount !== amount) {
      return left(new PaymentAmountMismatchError());
    }

    payment.markAsPaid(transactionNsu);

    await this.paymentsRepository.save(payment);

    const existingEnrollment = await this.enrollmentsRepository.findByStudentIdAndCourseId(
      payment.accountId.toString(),
      payment.courseId.toString(),
    );

    if (!existingEnrollment) {
      const enrollment = Enrollment.create({
        studentId: payment.accountId,
        courseId: payment.courseId,
      });

      await this.enrollmentsRepository.create(enrollment);
    }

    return right({ success: true });
  }
}

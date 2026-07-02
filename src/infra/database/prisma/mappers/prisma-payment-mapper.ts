import type { Prisma, Payment as PrismaPayment } from '@prisma/client';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Payment } from 'src/domain/youcourse/enterprise/entities/payment';

export class PrismaPaymentMapper {
  static toDomain(raw: PrismaPayment): Payment {
    return Payment.create(
      {
        courseId: new UniqueEntityID(raw.courseId),
        accountId: new UniqueEntityID(raw.accountId),
        amount: raw.amount,
        status: raw.status as 'PENDING' | 'PAID' | 'FAILED',
        paymentUrl: raw.paymentUrl,
        transactionNsu: raw.transactionNsu,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(payment: Payment): Prisma.PaymentUncheckedCreateInput {
    return {
      id: payment.id.toString(),
      courseId: payment.courseId.toString(),
      accountId: payment.accountId.toString(),
      amount: payment.amount,
      status: payment.status,
      paymentUrl: payment.paymentUrl ?? null,
      transactionNsu: payment.transactionNsu ?? null,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt ?? null,
    };
  }
}

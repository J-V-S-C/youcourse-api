import { Injectable } from '@nestjs/common';
import { PaymentsRepository } from 'src/domain/youcourse/application/repositories/payments-repository';
import { Payment } from 'src/domain/youcourse/enterprise/entities/payment';
import { PrismaService } from '../prisma.service';
import { PrismaPaymentMapper } from '../mappers/prisma-payment-mapper';

@Injectable()
export class PrismaPaymentsRepository implements PaymentsRepository {
  constructor(private prisma: PrismaService) {}

  async create(payment: Payment): Promise<void> {
    const data = PrismaPaymentMapper.toPrisma(payment);
    await this.prisma.payment.create({
      data,
    });
  }

  async save(payment: Payment): Promise<void> {
    const data = PrismaPaymentMapper.toPrisma(payment);

    await this.prisma.payment.update({
      where: {
        id: data.id,
      },
      data,
    });
  }

  async findById(id: string): Promise<Payment | null> {
    const payment = await this.prisma.payment.findUnique({
      where: {
        id,
      },
    });

    if (!payment) {
      return null;
    }

    return PrismaPaymentMapper.toDomain(payment);
  }
}

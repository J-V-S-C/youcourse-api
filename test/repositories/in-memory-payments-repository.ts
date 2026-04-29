import { PaymentsRepository } from 'src/domain/youcourse/application/repositories/payments-repository';
import { Payment } from 'src/domain/youcourse/enterprise/entities/payment';

export class InMemoryPaymentsRepository implements PaymentsRepository {
  public items: Payment[] = [];

  async create(payment: Payment): Promise<void> {
    this.items.push(payment);
  }

  async save(payment: Payment): Promise<void> {
    const itemIndex = this.items.findIndex((item) =>
      item.id.equals(payment.id),
    );
    this.items[itemIndex] = payment;
  }

  async findById(id: string): Promise<Payment | null> {
    const payment = this.items.find((item) => item.id.toString() === id);
    if (!payment) {
      return null;
    }
    return payment;
  }
}

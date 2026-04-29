import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Optional } from 'src/core/types/optional';

export interface PaymentProps {
  courseId: UniqueEntityID;
  accountId: UniqueEntityID;
  amount: number; // centavos
  status: 'PENDING' | 'PAID' | 'FAILED';
  paymentUrl?: string | null;
  transactionNsu?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class Payment extends Entity<PaymentProps> {
  get courseId() {
    return this.props.courseId;
  }
  get accountId() {
    return this.props.accountId;
  }
  get amount() {
    return this.props.amount;
  }
  get status() {
    return this.props.status;
  }
  get paymentUrl() {
    return this.props.paymentUrl;
  }
  get transactionNsu() {
    return this.props.transactionNsu;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  setPaymentUrl(url: string) {
    this.props.paymentUrl = url;
    this.touch();
  }

  markAsPaid(transactionNsu: string) {
    this.props.status = 'PAID';
    this.props.transactionNsu = transactionNsu;
    this.touch();
  }

  markAsFailed() {
    this.props.status = 'FAILED';
    this.touch();
  }

  static create(
    props: Optional<PaymentProps, 'createdAt' | 'status'>,
    id?: UniqueEntityID,
  ) {
    return new Payment(
      {
        ...props,
        status: props.status ?? 'PENDING',
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }
}

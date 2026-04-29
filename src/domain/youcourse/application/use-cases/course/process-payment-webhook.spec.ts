import { ProcessPaymentWebhookUseCase } from './process-payment-webhook';
import { InMemoryPaymentsRepository } from 'test/repositories/in-memory-payments-repository';
import { Payment } from 'src/domain/youcourse/enterprise/entities/payment';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { PaymentAmountMismatchError } from '../errors/payment-amount-mismatch-error';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

let inMemoryPaymentsRepository: InMemoryPaymentsRepository;
let sut: ProcessPaymentWebhookUseCase;

describe('Process Payment Webhook Use Case', () => {
  beforeEach(() => {
    inMemoryPaymentsRepository = new InMemoryPaymentsRepository();
    sut = new ProcessPaymentWebhookUseCase(inMemoryPaymentsRepository);
  });

  it('should be able to process a successful payment webhook', async () => {
    const payment = Payment.create({
      courseId: new UniqueEntityID(),
      accountId: new UniqueEntityID(),
      amount: 5000,
    });
    await inMemoryPaymentsRepository.create(payment);

    const result = await sut.execute({
      orderNsu: payment.id.toString(),
      transactionNsu: 'txn-123',
      amount: 5000,
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryPaymentsRepository.items[0].status).toBe('PAID');
    expect(inMemoryPaymentsRepository.items[0].transactionNsu).toBe('txn-123');
  });

  it('should return error if payment amount does not match', async () => {
    const payment = Payment.create({
      courseId: new UniqueEntityID(),
      accountId: new UniqueEntityID(),
      amount: 5000,
    });
    await inMemoryPaymentsRepository.create(payment);

    const result = await sut.execute({
      orderNsu: payment.id.toString(),
      transactionNsu: 'txn-123',
      amount: 1000,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(PaymentAmountMismatchError);
    expect(inMemoryPaymentsRepository.items[0].status).toBe('PENDING');
  });

  it('should return error if payment does not exist', async () => {
    const result = await sut.execute({
      orderNsu: 'invalid-id',
      transactionNsu: 'txn-123',
      amount: 5000,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should handle idempotency (ignore if already paid)', async () => {
    const payment = Payment.create({
      courseId: new UniqueEntityID(),
      accountId: new UniqueEntityID(),
      amount: 5000,
    });
    payment.markAsPaid('txn-old');
    await inMemoryPaymentsRepository.create(payment);

    const result = await sut.execute({
      orderNsu: payment.id.toString(),
      transactionNsu: 'txn-new',
      amount: 5000,
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryPaymentsRepository.items[0].transactionNsu).toBe('txn-old');
  });
});

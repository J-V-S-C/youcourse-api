import { PurchaseCourseUseCase } from './purchase-course';
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { InMemoryAccountsRepository } from 'test/repositories/in-memory-accounts-repository';
import { InMemoryPaymentsRepository } from 'test/repositories/in-memory-payments-repository';
import { FakePaymentGateway } from 'test/services/fake-payment-gateway';
import { makeCourse } from 'test/factories/make-course';
import { makeAccount } from 'test/factories/make-account';
import { Price } from 'src/domain/youcourse/enterprise/entities/value-objects/price';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

let inMemoryCoursesRepository: InMemoryCoursesRepository;
let inMemoryAccountsRepository: InMemoryAccountsRepository;
let inMemoryPaymentsRepository: InMemoryPaymentsRepository;
let fakePaymentGateway: FakePaymentGateway;
let sut: PurchaseCourseUseCase;

describe('Purchase Course Use Case', () => {
  beforeEach(() => {
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    inMemoryAccountsRepository = new InMemoryAccountsRepository();
    inMemoryPaymentsRepository = new InMemoryPaymentsRepository();
    fakePaymentGateway = new FakePaymentGateway();

    sut = new PurchaseCourseUseCase(
      inMemoryCoursesRepository,
      inMemoryAccountsRepository,
      inMemoryPaymentsRepository,
      fakePaymentGateway,
    );
  });

  it('should be able to generate a purchase link and save payment intent', async () => {
    const account = makeAccount();
    await inMemoryAccountsRepository.create(account);

    const course = makeCourse({
      price: Price.create({ amount: 10000, currency: 'BRL' }),
      sellable: true,
    });
    await inMemoryCoursesRepository.create(course);

    const result = await sut.execute({
      accountId: account.id.toString(),
      courseId: course.id.toString(),
    });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      expect(inMemoryPaymentsRepository.items).toHaveLength(1);

      const savedPayment = inMemoryPaymentsRepository.items[0];

      expect(savedPayment.courseId.toString()).toBe(course.id.toString());
      expect(savedPayment.accountId.toString()).toBe(account.id.toString());
      expect(savedPayment.amount).toBe(10000);
      expect(savedPayment.status).toBe('PENDING');

      expect(result.value.paymentUrl).toContain(savedPayment.id.toString());

      expect(savedPayment.paymentUrl).toBe(result.value.paymentUrl);
    }
  });

  it('should not be able to purchase a course that does not exist', async () => {
    const account = makeAccount();
    await inMemoryAccountsRepository.create(account);

    const result = await sut.execute({
      accountId: account.id.toString(),
      courseId: 'non-existent-course',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    expect(inMemoryPaymentsRepository.items).toHaveLength(0);
  });

  it('should not be able to purchase a course if account does not exist', async () => {
    const course = makeCourse({
      price: Price.create({ amount: 1000, currency: 'BRL' }),
      sellable: true,
    });
    await inMemoryCoursesRepository.create(course);

    const result = await sut.execute({
      accountId: 'non-existent-account',
      courseId: course.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    expect(inMemoryPaymentsRepository.items).toHaveLength(0);
  });

  it('should not be able to purchase a course that is not sellable', async () => {
    const account = makeAccount();
    await inMemoryAccountsRepository.create(account);

    const course = makeCourse({
      price: undefined,
      sellable: false,
    });
    await inMemoryCoursesRepository.create(course);

    const result = await sut.execute({
      accountId: account.id.toString(),
      courseId: course.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    expect(inMemoryPaymentsRepository.items).toHaveLength(0);
  });

  it('should send the correct amount in cents to the gateway', async () => {
    const account = makeAccount();
    await inMemoryAccountsRepository.create(account);

    const course = makeCourse({
      price: Price.create({ amount: 4990, currency: 'BRL' }),
      sellable: true,
    });
    await inMemoryCoursesRepository.create(course);

    const createCheckoutLinkSpy = vi.spyOn(
      fakePaymentGateway,
      'createCheckoutLink',
    );

    await sut.execute({
      accountId: account.id.toString(),
      courseId: course.id.toString(),
    });

    expect(createCheckoutLinkSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 4990,
      }),
    );
  });

  it('should be able to enroll in a free course without calling the payment gateway', async () => {
    const account = makeAccount();
    await inMemoryAccountsRepository.create(account);

    const course = makeCourse({
      price: Price.create({ amount: 0, currency: 'BRL' }),
      sellable: true,
    });
    await inMemoryCoursesRepository.create(course);

    const createCheckoutLinkSpy = vi.spyOn(
      fakePaymentGateway,
      'createCheckoutLink',
    );

    const result = await sut.execute({
      accountId: account.id.toString(),
      courseId: course.id.toString(),
    });

    expect(result.isRight()).toBe(true);

    expect(createCheckoutLinkSpy).not.toHaveBeenCalled();

    expect(inMemoryPaymentsRepository.items).toHaveLength(1);
    expect(inMemoryPaymentsRepository.items[0].status).toBe('PAID');
    expect(inMemoryPaymentsRepository.items[0].amount).toBe(0);

    if (result.isRight()) {
      expect(result.value.paymentUrl).toBe('FREE_ENROLLMENT');
    }
  });
});

import type {
  CreatePaymentLinkParams,
  PaymentGateway,
  PaymentLinkResponse,
} from 'src/domain/youcourse/application/services/payment-gateway';

export class FakePaymentGateway implements PaymentGateway {
  async createCheckoutLink(
    params: CreatePaymentLinkParams,
  ): Promise<PaymentLinkResponse> {
    return {
      paymentUrl: `https://checkout.example.com/${params.orderId}`,
      transactionNsu: 'fake-transaction-nsu-123',
    };
  }
}

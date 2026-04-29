export interface CreatePaymentLinkParams {
  orderId: string;
  amount: number;
  customer: {
    name: string;
    email: string;
  };
  courseName: string;
}

export interface PaymentLinkResponse {
  paymentUrl: string;
  transactionNsu: string;
}

export abstract class PaymentGateway {
  abstract createCheckoutLink(params: CreatePaymentLinkParams): Promise<PaymentLinkResponse>;
}

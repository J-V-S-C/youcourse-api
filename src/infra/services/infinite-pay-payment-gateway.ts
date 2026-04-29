import { Injectable } from '@nestjs/common';
import { EnvService } from '../env/env.service';
import {
  CreatePaymentLinkParams,
  PaymentGateway,
  PaymentLinkResponse,
} from 'src/domain/youcourse/application/services/payment-gateway';

@Injectable()
export class InfinitePayPaymentGateway implements PaymentGateway {
  constructor(private envService: EnvService) {}

  async createCheckoutLink(
    params: CreatePaymentLinkParams,
  ): Promise<PaymentLinkResponse> {
    const handle = this.envService.get('INFINITEPAY_HANDLE');
    const apiUrl = 'https://api.checkout.infinitepay.io/links';

    // Usando fetch nativo (Node 18+)
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        handle,
        order_nsu: params.orderId,
        items: [
          {
            description: params.courseName,
            quantity: 1,
            price: params.amount, // Valor em centavos
          },
        ],
        customer: {
          name: params.customer.name,
          email: params.customer.email,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to create InfinitePay link: ${errorBody}`);
    }

    const data = await response.json();

    return {
      paymentUrl: data.url,
      transactionNsu: data.slug,
    };
  }
}

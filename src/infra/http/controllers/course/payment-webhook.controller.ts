import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import { ProcessPaymentWebhookUseCase } from 'src/domain/youcourse/application/use-cases/course/process-payment-webhook';
import { Public } from 'src/infra/auth/public';
import z from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

const webhookBodySchema = z
  .object({
    order_nsu: z.string(),
    transaction_nsu: z.string(),
    amount: z.number().int(),
  })
  .loose();

type WebhookBodySchema = z.infer<typeof webhookBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(webhookBodySchema);

@ApiTags('Payments')
@Controller('/payments/webhook')
export class PaymentWebhookController {
  constructor(private processWebhook: ProcessPaymentWebhookUseCase) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Receive payment updates from InfinitePay' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Amount mismatch or invalid payload',
  })
  @ApiBody({
    schema: {
      example: {
        order_nsu: 'uuid-do-pagamento',
        transaction_nsu: 'nsu-da-transacao',
        amount: 5000,
      },
    },
  })
  @HttpCode(200)
  async handle(@Body(bodyValidationPipe) body: WebhookBodySchema) {
    const { order_nsu, transaction_nsu, amount } = body;

    const result = await this.processWebhook.execute({
      orderNsu: order_nsu,
      transactionNsu: transaction_nsu,
      amount,
    });

    if (result.isLeft()) {
      const error = result.value;
      throw new BadRequestException(error.message);
    }

    return { received: true };
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common';
import { RateProductUseCase } from 'src/domain/ecommerce/application/use-cases/rate-product';
import z from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { Price } from 'src/domain/ecommerce/enterprise/entities/value-objects/price';
import type { UserPayload } from 'src/infra/auth/jwt.strategy';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import { ProductPresenter } from '../presenters/product-presenter';
import { RatingPresenter } from '../presenters/rating-presenter';
import { ApiBearerAuth, ApiBody, ApiProperty } from '@nestjs/swagger';

export class RateProductDto {
  @ApiProperty({ minimum: 0.5, maximum: 5, multipleOf: 0.5, default: 5 })
  stars!: number;

  @ApiProperty({ required: false, default: 'Ótimo produto!' })
  commentary?: string;
}

const rateProductBodySchema = z.object({
  commentary: z.string().optional().default(''),
  stars: z
    .string()
    .transform(Number)
    .pipe(z.number().min(0.5).max(5).multipleOf(0.5)),
});

type RateProductBodySchema = z.infer<typeof rateProductBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(rateProductBodySchema);

@Controller('/products/:productId/rating')
export class RateProductController {
  constructor(private rateProduct: RateProductUseCase) {}

  @Post()
  @ApiBody({ type: RateProductDto })
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: RateProductBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('productId') productId: string,
  ) {
    const { commentary, stars } = body;
    const creatorId = user.sub;

    const result = await this.rateProduct.execute({
      creatorId,
      productId,
      stars,
      commentary,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const rating = result.value.rating;

    return { rating: RatingPresenter.toHTTP(rating) };
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common';
import { CreateProductUseCase } from 'src/domain/ecommerce/application/use-cases/create-product';
import z from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { Price } from 'src/domain/ecommerce/enterprise/entities/value-objects/price';
import type { UserPayload } from 'src/infra/auth/jwt.strategy';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import { ProductPresenter } from '../presenters/product-presenter';
import { ApiBearerAuth, ApiBody, ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ default: 'Produto Exemplo' })
  name!: string;

  @ApiProperty({ default: 'Descrição do produto' })
  description!: string;

  @ApiProperty({ required: false, default: { amount: 100, currency: 'BRL' } })
  price?: {
    amount: number;
    currency: string;
  };

  @ApiProperty({ required: false, default: true })
  sellable?: boolean;

  @ApiProperty({ required: false, default: true })
  visible?: boolean;
}

const priceSchema = z.object({
  amount: z.number(),
  currency: z.string(),
});

const createProductBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  price: priceSchema.optional(),
  sellable: z.boolean().optional(),
  visible: z.boolean().optional(),
});

type CreateProductBodySchema = z.infer<typeof createProductBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(createProductBodySchema);

@Controller('/products')
export class CreateProductController {
  constructor(private createProduct: CreateProductUseCase) {}

  @Post()
  @ApiBody({ type: CreateProductDto })
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: CreateProductBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { name, description, price, sellable, visible } = body;
    const priceVO = price ? Price.create(price) : undefined;
    const creatorId = user.sub;

    const result = await this.createProduct.execute({
      name,
      description,
      creatorId,
      price: priceVO,
      sellable,
      visible,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const product = result.value.product;

    return { product: ProductPresenter.toHTTP(product) };
  }
}

import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { FetchProductsUseCase } from 'src/domain/ecommerce/application/use-cases/fetch-products';
import z from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { ProductPresenter } from '../presenters/product-presenter';
import { Public } from 'src/infra/auth/public';
import { ApiProperty, ApiQuery } from '@nestjs/swagger';

export class FetchProductsQueryDto {
  @ApiProperty({ required: false, default: 1 })
  page?: number;

  @ApiProperty({
    required: false,
    default: 'recent',
    enum: ['recent', 'popular', 'bestSelling'],
  })
  orderBy?: 'recent' | 'popular' | 'bestSelling';
}

const fetchProductsBodySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().min(1)),
  orderBy: z
    .enum(['recent', 'popular', 'bestSelling'])
    .optional()
    .default('recent'),
});

type FetchProductsBodySchema = z.infer<typeof fetchProductsBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(fetchProductsBodySchema);

@Controller('/products')
export class FetchProductsController {
  constructor(private fetchProducts: FetchProductsUseCase) {}

  @Get()
  @ApiQuery({ type: FetchProductsQueryDto })
  @Public()
  async handle(@Query(bodyValidationPipe) body: FetchProductsBodySchema) {
    const { page, orderBy } = body;
    const perPage = 20;

    const result = await this.fetchProducts.execute({
      page,
      perPage,
      orderBy,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const products = result.value.visibleProducts;

    return { products: products.map(ProductPresenter.toHTTP) };
  }
}

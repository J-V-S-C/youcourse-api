import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { FetchProductsUseCase } from 'src/domain/e-commerce/application/use-cases/fetch-products';
import z from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { ProductPresenter } from '../presenters/product-presenter';

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

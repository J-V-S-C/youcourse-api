import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Patch,
  UsePipes,
} from '@nestjs/common';
import { z } from 'zod';
import { UpdateCoursePriceUseCase } from 'src/domain/youcourse/application/use-cases/course/update-course-price';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import type { UserPayload } from 'src/infra/auth/jwt.strategy';
import { Price } from 'src/domain/youcourse/enterprise/entities/value-objects/price';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';

export class UpdateCoursePriceDto {
  @ApiProperty({ default: { amount: 150, currency: 'BRL' } })
  price!: {
    amount: number;
    currency: string;
  };
}

const priceSchema = z.object({
  amount: z.number().refine((n) => Math.floor(n * 100) / 100 === n, {
    message: 'O valor deve ter no máximo 2 casas decimais',
  }),
  currency: z.string(),
});

const updateCoursePriceBodySchema = z.object({
  price: priceSchema,
});

type UpdateCoursePriceBodySchema = z.infer<typeof updateCoursePriceBodySchema>;

@ApiTags('Courses')
@Controller('/courses/:courseId/price')
export class UpdateCoursePriceController {
  constructor(private updateCoursePrice: UpdateCoursePriceUseCase) {}

  @Patch()
  @ApiOperation({ summary: 'Endpoint operation' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @HttpCode(204)
  @ApiBody({ type: UpdateCoursePriceDto })
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('courseId') courseId: string,
    @Body(new ZodValidationPipe(updateCoursePriceBodySchema))
    body: UpdateCoursePriceBodySchema,
  ) {
    const creatorId = user.sub;
    const priceVO = Price.create(body.price);

    const result = await this.updateCoursePrice.execute({
      creatorId,
      courseId,
      price: priceVO,
    });

    if (result.isLeft()) {
      const error = result.value;
      throw new BadRequestException(error.message);
    }
  }
}

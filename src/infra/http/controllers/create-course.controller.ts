import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common';
import { CreateCourseUseCase } from 'src/domain/ecommerce/application/use-cases/create-course';
import z from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { Price } from 'src/domain/ecommerce/enterprise/entities/value-objects/price';
import type { UserPayload } from 'src/infra/auth/jwt.strategy';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import { CoursePresenter } from '../presenters/course-presenter';
import { ApiBearerAuth, ApiBody, ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ default: 'Curso Exemplo' })
  name!: string;

  @ApiProperty({ default: 'Descrição do curso' })
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
  // Math.floor remove casas decimais restantes
  amount: z.number().refine((n) => Math.floor(n * 100) / 100 === n, {
    message: 'O valor deve ter no máximo 2 casas decimais',
  }),
  currency: z.string(),
});

const createCourseBodySchema = z.object({
  name: z.string().max(50),
  description: z.string().max(200),
  price: priceSchema.optional(),
  sellable: z.boolean().optional(),
  visible: z.boolean().optional(),
});

type CreateCourseBodySchema = z.infer<typeof createCourseBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(createCourseBodySchema);

@Controller('/courses')
export class CreateCourseController {
  constructor(private createCourse: CreateCourseUseCase) {}

  @Post()
  @ApiBody({ type: CreateCourseDto })
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: CreateCourseBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { name, description, price, sellable, visible } = body;
    const priceVO = price ? Price.create(price) : undefined;
    const creatorId = user.sub;

    const result = await this.createCourse.execute({
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

    const course = result.value.course;

    return { course: CoursePresenter.toHTTP(course) };
  }
}

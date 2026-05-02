import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import { CreateCourseUseCase } from 'src/domain/youcourse/application/use-cases/course/create-course';
import z from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { Price } from 'src/domain/youcourse/enterprise/entities/value-objects/price';
import type { UserPayload } from 'src/infra/auth/jwt.strategy';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import { CoursePresenter } from '../../presenters/course-presenter';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';

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
  amount: z.number()
    .int('O valor deve ser um número inteiro')
    .min(150, 'O valor mínimo é 150 centavos')
    .transform((n) => Math.floor(n)),
  currency: z.string(),
});

const createCourseBodySchema = z.object({
  name: z.string().max(50),
  description: z.string().max(200),
  price: priceSchema.optional(),
  sellable: z.boolean().optional().default(false),
  visible: z.boolean().optional().default(false),
}).refine((data) => {
  if (data.sellable && !data.price) {
    return false;
  }
  return true;
}, {
  message: "Cursos marcados para venda devem obrigatoriamente ter um preço.",
  path: ["price"],
});;

type CreateCourseBodySchema = z.infer<typeof createCourseBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(createCourseBodySchema);

@ApiTags('Courses')
@Controller('/courses')
export class CreateCourseController {
  constructor(private createCourse: CreateCourseUseCase) { }

  @Post()
  @ApiOperation({ summary: 'Endpoint operation' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
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

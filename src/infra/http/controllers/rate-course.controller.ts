import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common';
import { RateCourseUseCase } from 'src/domain/ecommerce/application/use-cases/rate-course';
import z from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { Price } from 'src/domain/ecommerce/enterprise/entities/value-objects/price';
import type { UserPayload } from 'src/infra/auth/jwt.strategy';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import { CoursePresenter } from '../presenters/course-presenter';
import { RatingPresenter } from '../presenters/rating-presenter';
import { ApiBearerAuth, ApiBody, ApiProperty } from '@nestjs/swagger';

export class RateCourseDto {
  @ApiProperty({ minimum: 0.5, maximum: 5, multipleOf: 0.5, default: 5 })
  stars!: number;

  @ApiProperty({ required: false, default: 'Ótimo curso!' })
  commentary?: string;
}

const rateCourseBodySchema = z.object({
  commentary: z.string().max(255).optional().default(''),
  stars: z
    .string()
    .transform(Number)
    .pipe(z.number().min(0.5).max(5).multipleOf(0.5)),
});

type RateCourseBodySchema = z.infer<typeof rateCourseBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(rateCourseBodySchema);

@Controller('/courses/:courseId/rating')
export class RateCourseController {
  constructor(private rateCourse: RateCourseUseCase) {}

  @Post()
  @ApiBody({ type: RateCourseDto })
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: RateCourseBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('courseId') courseId: string,
  ) {
    const { commentary, stars } = body;
    const creatorId = user.sub;

    const result = await this.rateCourse.execute({
      creatorId,
      courseId,
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

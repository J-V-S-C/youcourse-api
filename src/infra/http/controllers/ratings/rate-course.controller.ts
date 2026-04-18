import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { RateCourseUseCase } from 'src/domain/youcourse/application/use-cases/ratings/rate-course';
import z from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import type { UserPayload } from 'src/infra/auth/jwt.strategy';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import { RatingPresenter } from '../../presenters/rating-presenter';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';

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

@ApiTags('Courses')
@Controller('/courses/:courseId/rating')
export class RateCourseController {
  constructor(private rateCourse: RateCourseUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Endpoint operation' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
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

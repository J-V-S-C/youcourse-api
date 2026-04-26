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
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { PublishCourseUseCase } from 'src/domain/youcourse/application/use-cases/course/publish-course';
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

export class PublishCourseDto {
  @ApiProperty({ default: { amount: 100, currency: 'BRL' } })
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

const publishCourseBodySchema = z.object({
  price: priceSchema,
});

type PublishCourseBodySchema = z.infer<typeof publishCourseBodySchema>;

@ApiTags('Courses')
@Controller('/courses/:courseId/publish')
export class PublishCourseController {
  constructor(private publishCourse: PublishCourseUseCase) {}

  @Patch()
  @ApiOperation({ summary: 'Endpoint operation' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @HttpCode(204)
  @ApiBody({ type: PublishCourseDto })
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('courseId') courseId: string,
    @Body(new ZodValidationPipe(publishCourseBodySchema))
    body: PublishCourseBodySchema,
  ) {
    const creatorId = user.sub;
    const priceVO = Price.create(body.price);

    const result = await this.publishCourse.execute({
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

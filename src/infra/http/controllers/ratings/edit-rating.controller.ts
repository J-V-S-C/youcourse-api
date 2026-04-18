import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
  Patch,
  UsePipes,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { EditRatingUseCase } from 'src/domain/youcourse/application/use-cases/ratings/edit-rating';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import type { UserPayload } from 'src/infra/auth/jwt.strategy';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';

export class EditRatingDto {
  @ApiProperty({ required: false })
  commentary?: string;

  @ApiProperty({ required: false })
  stars?: number;
}

const editRatingBodySchema = z.object({
  commentary: z.string().optional(),
  stars: z.number().min(1).max(5).optional(),
});

type EditRatingBodySchema = z.infer<typeof editRatingBodySchema>;

@ApiTags('Ratings')
@Controller('/ratings/:ratingId')
export class EditRatingController {
  constructor(private editRating: EditRatingUseCase) {}

  @Put()
  @ApiOperation({ summary: 'Endpoint operation' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @HttpCode(204)
  @ApiBody({ type: EditRatingDto })
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('ratingId') ratingId: string,
    @Body(new ZodValidationPipe(editRatingBodySchema))
    body: EditRatingBodySchema,
  ) {
    const creatorId = user.sub;
    const { commentary, stars } = body;

    const result = await this.editRating.execute({
      creatorId,
      ratingId,
      commentary,
      stars,
    });

    if (result.isLeft()) {
      const error = result.value;
      throw new BadRequestException(error.message);
    }
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Patch,
} from '@nestjs/common';
import { ReorderUnitUseCase } from 'src/domain/youcourse/application/use-cases/unit/reorder-unit';
import z from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import type { UserPayload } from 'src/infra/auth/jwt.strategy';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
  ApiParam,
} from '@nestjs/swagger';

export class ReorderUnitDto {
  @ApiProperty({ default: 0 })
  position!: number;
}

const reorderUnitBodySchema = z.object({
  position: z.number().int().min(0),
});

type ReorderUnitBodySchema = z.infer<typeof reorderUnitBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(reorderUnitBodySchema);

@ApiTags('Units')
@Controller('/units/:unitId/reorder')
export class ReorderUnitController {
  constructor(private reorderUnit: ReorderUnitUseCase) {}

  @Patch()
  @ApiOperation({ summary: 'Reorder a unit' })
  @ApiResponse({ status: 200, description: 'Unit reordered successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: ReorderUnitDto })
  @ApiParam({ name: 'unitId', description: 'Unit ID' })
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: ReorderUnitBodySchema,
    @Param('unitId') unitId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const { position } = body;
    const creatorId = user.sub;

    const result = await this.reorderUnit.execute({
      creatorId,
      unitId,
      position,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error.message.includes('Unit')) {
        throw new BadRequestException('Unit not found');
      }
      if (error.message.includes('Course')) {
        throw new BadRequestException('Course not found');
      }
      throw new BadRequestException('Cannot reorder unit');
    }

    return { unitId: result.value.unitId };
  }
}
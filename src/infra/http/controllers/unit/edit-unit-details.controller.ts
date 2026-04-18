import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Patch,
} from '@nestjs/common';
import { EditUnitDetailsUseCase } from 'src/domain/youcourse/application/use-cases/unit/edit-unit-details';
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

export class EditUnitDetailsDto {
  @ApiProperty({ required: false, default: 'Updated Unit Name' })
  name?: string;

  @ApiProperty({ required: false, default: 'Updated description' })
  description?: string;
}

const editUnitBodySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

type EditUnitBodySchema = z.infer<typeof editUnitBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(editUnitBodySchema);

@ApiTags('Units')
@Controller('/units/:unitId')
export class EditUnitDetailsController {
  constructor(private editUnitDetails: EditUnitDetailsUseCase) {}

  @Patch()
  @ApiOperation({ summary: 'Edit unit details' })
  @ApiResponse({ status: 200, description: 'Unit updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: EditUnitDetailsDto })
  @ApiParam({ name: 'unitId', description: 'Unit ID' })
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: EditUnitBodySchema,
    @Param('unitId') unitId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const { name, description } = body;
    const creatorId = user.sub;

    const result = await this.editUnitDetails.execute({
      creatorId,
      unitId,
      name,
      description,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error.message.includes('Unit')) {
        throw new BadRequestException('Unit not found');
      }
      if (error.message.includes('Course')) {
        throw new BadRequestException('Course not found');
      }
      throw new BadRequestException('Cannot edit unit');
    }

    return { unitId: result.value.unitId };
  }
}
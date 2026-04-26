import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  Param,
} from '@nestjs/common';
import { DeleteUnitUseCase } from 'src/domain/youcourse/application/use-cases/unit/delete-unit';
import type { UserPayload } from 'src/infra/auth/jwt.strategy';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Units')
@Controller('/units/:unitId')
export class DeleteUnitController {
  constructor(private deleteUnit: DeleteUnitUseCase) {}

  @Delete()
  @ApiOperation({ summary: 'Delete a unit' })
  @ApiResponse({ status: 204, description: 'Unit deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiParam({ name: 'unitId', description: 'Unit ID' })
  @HttpCode(204)
  async handle(
    @Param('unitId') unitId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const creatorId = user.sub;

    const result = await this.deleteUnit.execute({
      creatorId,
      unitId,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error.message.includes('Unit')) {
        throw new BadRequestException('Unit not found');
      }
      if (error.message.includes('Course')) {
        throw new BadRequestException('Course not found');
      }
      throw new BadRequestException('Cannot delete unit');
    }

    return;
  }
}
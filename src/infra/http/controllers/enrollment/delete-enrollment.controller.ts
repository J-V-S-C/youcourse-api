import {
  Controller,
  Delete,
  Param,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { DeleteEnrollmentUseCase } from 'src/domain/youcourse/application/use-cases/enrollment/delete-enrollment';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { UserPayload } from 'src/infra/auth/jwt.strategy';

@ApiTags('Enrollments')
@ApiBearerAuth()
@Controller('/courses/:courseId/enrollment')
export class DeleteEnrollmentController {
  constructor(private deleteEnrollment: DeleteEnrollmentUseCase) {}

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Cancelar/Remover matrícula em um curso' })
  @ApiResponse({ status: 204, description: 'Matrícula removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Matrícula não encontrada' })
  async handle(
    @Param('courseId') courseId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.deleteEnrollment.execute({
      courseId,
      accountId: user.sub,
    });

    if (result.isLeft()) {
      throw new NotFoundException();
    }
  }
}

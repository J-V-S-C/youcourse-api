import {
  Controller,
  Get,
  Param,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { VerifyCourseAccessUseCase } from 'src/domain/youcourse/application/use-cases/enrollment/verify-course-access';
import { EnrollmentPresenter } from '../../presenters/enrollment-presenter';
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
@Controller('/courses/:courseId/access-validate')
export class VerifyCourseAccessController {
  constructor(private verifyCourseAccess: VerifyCourseAccessUseCase) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Validar se o usuário logado possui acesso ativo ao curso',
  })
  @ApiResponse({ status: 200, description: 'Acesso validado com sucesso' })
  @ApiResponse({
    status: 404,
    description: 'Acesso negado ou curso não encontrado',
  })
  async handle(
    @Param('courseId') courseId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.verifyCourseAccess.execute({
      courseId,
      accountId: user.sub,
    });

    if (result.isLeft()) {
      throw new NotFoundException();
    }

    return { enrollment: EnrollmentPresenter.toHTTP(result.value.enrollment) };
  }
}

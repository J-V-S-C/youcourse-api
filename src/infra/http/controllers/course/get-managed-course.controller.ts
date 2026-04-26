import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { GetCourseByIdUseCase } from 'src/domain/youcourse/application/use-cases/course/get-course-by-id';
import { CoursePresenter } from '../../presenters/course-presenter';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import { NotAllowedError } from 'src/domain/youcourse/application/use-cases/errors/not-allowed-error';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { UserPayload } from 'src/infra/auth/jwt.strategy';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('/courses/managed')
export class GetManagedCourseController {
  constructor(private getCourseById: GetCourseByIdUseCase) {}

  @Get('/:id')
  @ApiOperation({ summary: 'Obter detalhes para edição (apenas dono)' })
  @ApiResponse({ status: 200, description: 'Sucesso' })
  @ApiResponse({ status: 403, description: 'Não autorizado' })
  async handle(
    @Param('id') courseId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.getCourseById.execute({
      courseId,
      userId: user.sub,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof NotAllowedError) {
        throw new ForbiddenException(error.message);
      }

      throw new BadRequestException(error.message);
    }

    return { course: CoursePresenter.toHTTP(result.value.course) };
  }
}

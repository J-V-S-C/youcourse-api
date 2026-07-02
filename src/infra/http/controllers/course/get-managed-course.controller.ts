import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { GetManagedCourseByIdUseCase } from 'src/domain/youcourse/application/use-cases/course/get-managed-course-by-id';
import { CoursePresenter } from '../../presenters/course-presenter';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
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
  constructor(private getManagedCourseById: GetManagedCourseByIdUseCase) {}

  @Get('/:id')
  @ApiOperation({ summary: 'Obter detalhes para edição (apenas dono)' })
  @ApiResponse({ status: 200, description: 'Sucesso' })
  @ApiResponse({ status: 403, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  async handle(
    @Param('id') courseId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.getManagedCourseById.execute({
      courseId,
      userId: user.sub,
    });

    if (result.isLeft()) {
      const error = result.value;
      const errorName = error.constructor.name;

      if (errorName === 'NotAllowedError') {
        throw new ForbiddenException(error.message);
      }

      if (errorName === 'ResourceNotFoundError') {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException(error.message);
    }

    return { course: CoursePresenter.toHTTP(result.value.course) };
  }
}

import {
  BadRequestException,
  Controller,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { GetCourseByIdUseCase } from 'src/domain/youcourse/application/use-cases/course/get-course-by-id';
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
@Controller('/courses/enrolled')
export class GetEnrolledCourseController {
  constructor(private getCourseById: GetCourseByIdUseCase) {}

  @Get('/:id')
  @ApiOperation({
    summary:
      'Obter detalhes do curso matriculado (apenas alunos inscritos ou dono)',
  })
  @ApiResponse({ status: 200, description: 'Sucesso' })
  @ApiResponse({
    status: 404,
    description: 'Curso não encontrado ou acesso negado',
  })
  async handle(
    @Param('id') courseId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.getCourseById.execute({
      courseId,
      userId: user.sub,
    });

    if (result.isLeft()) {
      throw new NotFoundException();
    }

    return { course: CoursePresenter.toHTTP(result.value.course) };
  }
}

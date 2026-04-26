import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { GetCourseByIdUseCase } from 'src/domain/youcourse/application/use-cases/course/get-course-by-id';
import { CoursePresenter } from '../../presenters/course-presenter';
import { Public } from 'src/infra/auth/public';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Courses')
@Controller('/courses')
export class GetPublicCourseController {
  constructor(private getCourseById: GetCourseByIdUseCase) {}

  @Get('/:id')
  @Public()
  @ApiOperation({ summary: 'Visualização pública do curso' })
  @ApiResponse({ status: 200, description: 'Sucesso' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado ou privado' })
  async handle(@Param('id') courseId: string) {
    const result = await this.getCourseById.execute({
      courseId,
    });

    if (result.isLeft()) {
      throw new NotFoundException();
    }

    return { course: CoursePresenter.toHTTP(result.value.course) };
  }
}

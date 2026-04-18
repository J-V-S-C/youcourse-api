import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  BadRequestException,
  Controller,
  HttpCode,
  Param,
  Patch,
} from '@nestjs/common';
import { UnpublishCourseUseCase } from 'src/domain/youcourse/application/use-cases/course/unpublish-course';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import type { UserPayload } from 'src/infra/auth/jwt.strategy';

@ApiTags('Courses')
@Controller('/courses/:courseId/unpublish')
export class UnpublishCourseController {
  constructor(private unpublishCourse: UnpublishCourseUseCase) {}

  @Patch()
  @ApiOperation({ summary: 'Endpoint operation' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @HttpCode(204)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('courseId') courseId: string,
  ) {
    const creatorId = user.sub;

    const result = await this.unpublishCourse.execute({
      creatorId,
      courseId,
    });

    if (result.isLeft()) {
      const error = result.value;
      throw new BadRequestException(error.message);
    }
  }
}

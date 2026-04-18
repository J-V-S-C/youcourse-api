import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  BadRequestException,
  Controller,
  HttpCode,
  Param,
  Patch,
} from '@nestjs/common';
import { HideCourseUseCase } from 'src/domain/youcourse/application/use-cases/course/hide-course';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import type { UserPayload } from 'src/infra/auth/jwt.strategy';

@ApiTags('Courses')
@Controller('/courses/:courseId/hide')
export class HideCourseController {
  constructor(private hideCourse: HideCourseUseCase) {}

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

    const result = await this.hideCourse.execute({
      creatorId,
      courseId,
    });

    if (result.isLeft()) {
      const error = result.value;
      throw new BadRequestException(error.message);
    }
  }
}

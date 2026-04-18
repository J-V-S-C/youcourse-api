import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  Param,
} from '@nestjs/common';
import { DeleteLessonUseCase } from 'src/domain/youcourse/application/use-cases/lesson/delete-lesson';
import type { UserPayload } from 'src/infra/auth/jwt.strategy';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Lessons')
@Controller('/lessons/:lessonId')
export class DeleteLessonController {
  constructor(private deleteLesson: DeleteLessonUseCase) {}

  @Delete()
  @ApiOperation({ summary: 'Delete a lesson' })
  @ApiResponse({ status: 204, description: 'Lesson deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @HttpCode(204)
  async handle(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const creatorId = user.sub;

    const result = await this.deleteLesson.execute({
      creatorId,
      lessonId,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error.message.includes('Lesson')) {
        throw new BadRequestException('Lesson not found');
      }
      if (error.message.includes('Unit')) {
        throw new BadRequestException('Unit not found');
      }
      if (error.message.includes('Course')) {
        throw new BadRequestException('Course not found');
      }
      throw new BadRequestException('Cannot delete lesson');
    }

    return;
  }
}
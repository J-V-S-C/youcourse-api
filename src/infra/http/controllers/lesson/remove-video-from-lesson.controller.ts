import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  Param,
} from '@nestjs/common';
import { RemoveVideoFromLessonUseCase } from 'src/domain/youcourse/application/use-cases/lesson/remove-video-from-lesson';
import type { UserPayload } from 'src/infra/auth/jwt.strategy';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Lessons')
@Controller('/lessons/:lessonId/video')
export class RemoveVideoFromLessonController {
  constructor(private removeVideo: RemoveVideoFromLessonUseCase) {}

  @Delete()
  @ApiOperation({ summary: 'Remove video from a lesson' })
  @ApiResponse({ status: 200, description: 'Video removed successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @HttpCode(200)
  async handle(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const creatorId = user.sub;

    const result = await this.removeVideo.execute({
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
      throw new BadRequestException('Cannot remove video');
    }

    return { lessonId: result.value.lessonId };
  }
}
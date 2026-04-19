import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { AttachVideoToLessonUseCase } from 'src/domain/youcourse/application/use-cases/lesson/attach-video-to-lesson';
import z from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import type { UserPayload } from 'src/infra/auth/jwt.strategy';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
  ApiParam,
} from '@nestjs/swagger';

export class AttachVideoDto {
  @ApiProperty({ default: 'video.mp4' })
  filename!: string;

  @ApiProperty({ default: 'video/mp4' })
  contentType!: string;
}

const attachVideoBodySchema = z.object({
  filename: z.string().min(1),
  contentType: z.string(),
});

type AttachVideoBodySchema = z.infer<typeof attachVideoBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(attachVideoBodySchema);

@ApiTags('Lessons')
@Controller('/lessons/:lessonId/video')
export class AttachVideoToLessonController {
  constructor(private attachVideo: AttachVideoToLessonUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Attach video to a lesson' })
  @ApiResponse({ status: 201, description: 'Video attached successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: AttachVideoDto })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: AttachVideoBodySchema,
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const { filename, contentType } = body;
    const creatorId = user.sub;

    const result = await this.attachVideo.execute({
      creatorId,
      lessonId,
      filename,
      contentType,
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
      throw new BadRequestException('Cannot attach video');
    }

    const { lessonId: resultLessonId, video } = result.value;

    return {
      lessonId: resultLessonId,
      video,
    };
  }
}

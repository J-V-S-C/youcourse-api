import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Patch,
} from '@nestjs/common';
import { ReorderLessonUseCase } from 'src/domain/youcourse/application/use-cases/lesson/reorder-lesson';
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

export class ReorderLessonDto {
  @ApiProperty({ default: 0 })
  position!: number;
}

const reorderLessonBodySchema = z.object({
  position: z.number().int().min(0),
});

type ReorderLessonBodySchema = z.infer<typeof reorderLessonBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(reorderLessonBodySchema);

@ApiTags('Lessons')
@Controller('/lessons/:lessonId/reorder')
export class ReorderLessonController {
  constructor(private reorderLesson: ReorderLessonUseCase) {}

  @Patch()
  @ApiOperation({ summary: 'Reorder a lesson' })
  @ApiResponse({ status: 200, description: 'Lesson reordered successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: ReorderLessonDto })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: ReorderLessonBodySchema,
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const { position } = body;
    const creatorId = user.sub;

    const result = await this.reorderLesson.execute({
      creatorId,
      lessonId,
      position,
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
      throw new BadRequestException('Cannot reorder lesson');
    }

    return { lessonId: result.value.lessonId };
  }
}
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Patch,
} from '@nestjs/common';
import { EditLessonDetailsUseCase } from 'src/domain/youcourse/application/use-cases/lesson/edit-lesson-details';
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

export class EditLessonDetailsDto {
  @ApiProperty({ required: false, default: 'Updated Lesson Name' })
  name?: string;

  @ApiProperty({ required: false, default: 'Updated description' })
  description?: string;

  @ApiProperty({ required: false, default: true })
  isPreview?: boolean;
}

const editLessonBodySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isPreview: z.boolean().optional(),
});

type EditLessonBodySchema = z.infer<typeof editLessonBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(editLessonBodySchema);

@ApiTags('Lessons')
@Controller('/lessons/:lessonId')
export class EditLessonDetailsController {
  constructor(private editLessonDetails: EditLessonDetailsUseCase) {}

  @Patch()
  @ApiOperation({ summary: 'Edit lesson details' })
  @ApiResponse({ status: 200, description: 'Lesson updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: EditLessonDetailsDto })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: EditLessonBodySchema,
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const { name, description, isPreview } = body;
    const creatorId = user.sub;

    const result = await this.editLessonDetails.execute({
      creatorId,
      lessonId,
      name,
      description,
      isPreview,
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
      throw new BadRequestException('Cannot edit lesson');
    }

    return { lessonId: result.value.lessonId };
  }
}
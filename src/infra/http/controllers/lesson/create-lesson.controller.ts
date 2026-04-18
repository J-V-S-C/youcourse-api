import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { CreateLessonUseCase } from 'src/domain/youcourse/application/use-cases/lesson/create-lesson';
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
} from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({ default: 'Introduction to Programming' })
  name!: string;

  @ApiProperty({ required: false, default: 'Learn the basics of programming' })
  description?: string;

  @ApiProperty({ required: false, default: 1 })
  position?: number;

  @ApiProperty({ required: false, default: false })
  isPreview?: boolean;
}

const createLessonBodySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  position: z.number().int().min(0).optional(),
  isPreview: z.boolean().optional(),
});

type CreateLessonBodySchema = z.infer<typeof createLessonBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(createLessonBodySchema);

@ApiTags('Lessons')
@Controller('/units/:unitId/lessons')
export class CreateLessonController {
  constructor(private createLesson: CreateLessonUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lesson in a unit' })
  @ApiResponse({ status: 201, description: 'Lesson created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: CreateLessonDto })
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: CreateLessonBodySchema,
    @Param('unitId') unitId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const { name, description, position, isPreview } = body;
    const creatorId = user.sub;

    const result = await this.createLesson.execute({
      creatorId,
      unitId,
      name,
      description,
      position,
      isPreview,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error.message.includes('Unit')) {
        throw new BadRequestException('Unit not found');
      }
      if (error.message.includes('Course')) {
        throw new BadRequestException('Course not found');
      }
      throw new BadRequestException('Cannot create lesson');
    }

    const lesson = result.value.lesson;

    return {
      lesson: {
        id: lesson.id.toString(),
        name: lesson.name,
        description: lesson.description,
        position: lesson.position,
        isPreview: lesson.isPreview,
        hasVideo: lesson.hasVideo,
        video: lesson.video,
        unitId: lesson.unitId.toString(),
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
      },
    };
  }
}
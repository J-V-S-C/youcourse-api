import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
  Patch,
  UsePipes,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { EditCourseDetailsUseCase } from 'src/domain/youcourse/application/use-cases/course/edit-course-details';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import type { UserPayload } from 'src/infra/auth/jwt.strategy';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';

export class EditCourseDetailsDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  description?: string;
}

const editCourseDetailsBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

type EditCourseDetailsBodySchema = z.infer<typeof editCourseDetailsBodySchema>;

@ApiTags('Courses')
@Controller('/courses/:courseId')
export class EditCourseDetailsController {
  constructor(private editCourseDetails: EditCourseDetailsUseCase) {}

  @Put()
  @ApiOperation({ summary: 'Endpoint operation' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @HttpCode(204)
  @ApiBody({ type: EditCourseDetailsDto })
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('courseId') courseId: string,
    @Body(new ZodValidationPipe(editCourseDetailsBodySchema)) body: EditCourseDetailsBodySchema,
  ) {
    const creatorId = user.sub;
    const { name, description } = body;

    const result = await this.editCourseDetails.execute({
      creatorId,
      courseId,
      name,
      description,
    });

    if (result.isLeft()) {
      const error = result.value;
      throw new BadRequestException(error.message);
    }
  }
}


import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
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
import { CreateEnrollmentUseCase } from 'src/domain/youcourse/application/use-cases/enrollment/create-enrollment';
import { EnrollmentPresenter } from '../../presenters/enrollment-presenter';

export class CreateEnrollmentDto {
  @ApiProperty({ default: 'Curso_Id' })
  courseId!: string;
}

const createEnrollmentBodySchema = z.object({
  courseId: z.uuid({ message: 'Invalid UUID format' }),
})

type CreateEnrollmentBodySchema = z.infer<typeof createEnrollmentBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(createEnrollmentBodySchema);

@ApiTags('Enrollments')
@Controller('/enrollments')
export class CreateEnrollmentController {
  constructor(private createEnrollment: CreateEnrollmentUseCase) { }

  @Post()
  @ApiOperation({ summary: 'Endpoint operation' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: CreateEnrollmentDto })
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: CreateEnrollmentBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { courseId } = body;
    const studentId = user.sub;

    const result = await this.createEnrollment.execute({
      courseId,
      studentId,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const enrollment = result.value.enrollment;

    return { enrollment: EnrollmentPresenter.toHTTP(enrollment) };
  }
}

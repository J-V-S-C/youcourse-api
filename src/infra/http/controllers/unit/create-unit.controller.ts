import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { CreateUnitUseCase } from 'src/domain/youcourse/application/use-cases/unit/create-unit';
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
import { UnitPresenter } from '../../presenters/unit-presenter';

export class CreateUnitDto {
  @ApiProperty({ default: 'Introduction Unit' })
  name!: string;

  @ApiProperty({ required: false, default: 'Learn the basics' })
  description?: string;

  @ApiProperty({ required: false, default: 0 })
  position?: number;
}

const createUnitBodySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  position: z.number().int().min(0).optional(),
});

type CreateUnitBodySchema = z.infer<typeof createUnitBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(createUnitBodySchema);

@ApiTags('Units')
@Controller('/courses/:courseId/units')
export class CreateUnitController {
  constructor(private createUnit: CreateUnitUseCase) { }

  @Post()
  @ApiOperation({ summary: 'Create a new unit in a course' })
  @ApiResponse({ status: 201, description: 'Unit created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: CreateUnitDto })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: CreateUnitBodySchema,
    @Param('courseId') courseId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const { name, description, position } = body;
    const creatorId = user.sub;

    const result = await this.createUnit.execute({
      creatorId,
      courseId,
      name,
      description,
      position,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error.message.includes('Course')) {
        throw new BadRequestException('Course not found');
      }
      throw new BadRequestException('Cannot create unit');
    }

    const unit = result.value.unit;

    return {
      unit: UnitPresenter.toHTTP(unit)
    };
  }
}

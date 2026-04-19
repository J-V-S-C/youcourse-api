import {
  Controller,
  Get,
  HttpCode,
  Param,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FetchLessonsUseCase } from 'src/domain/youcourse/application/use-cases/lesson/fetch-lessons';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import { UserPayload } from 'src/infra/auth/jwt.strategy';
import { LessonPresenter } from '../../presenters/lesson-presenter';

@ApiTags('Lessons')
@Controller('/units/:unitId/lessons')
export class FetchLessonsController {
  constructor(private fetchLessons: FetchLessonsUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Fetch all lessons of a unit' })
  @ApiResponse({ status: 200, description: 'Lessons fetched successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiParam({ name: 'unitId', description: 'Unit ID' })
  @HttpCode(200)
  async handle(
    @Param('unitId') unitId: string,
    @CurrentUser() user: UserPayload | null,
  ) {
    const result = await this.fetchLessons.execute({
      unitId,
      accountId: user?.sub,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error.message.includes('Unit') || error.message.includes('Course')) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException('Cannot fetch lessons');
    }

    const lessons = result.value.lessons;

    return {
      lessons: lessons.map(LessonPresenter.toHTTP),
    };
  }
}

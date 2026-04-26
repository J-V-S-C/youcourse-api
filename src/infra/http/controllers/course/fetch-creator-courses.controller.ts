import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { FetchCreatorCoursesUseCase } from 'src/domain/youcourse/application/use-cases/course/fetch-creator-courses';
import z from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CoursePresenter } from '../../presenters/course-presenter';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiProperty,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { UserPayload } from 'src/infra/auth/jwt.strategy';

export class FetchManagedCoursesQueryDto {
  @ApiProperty({ required: false, default: 1 })
  page?: number;

  @ApiProperty({
    required: false,
    default: 'recent',
    enum: ['recent', 'popular'],
  })
  orderBy?: 'recent' | 'popular';
}

const fetchManagedCoursesSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().min(1)),
  orderBy: z.enum(['recent', 'popular']).optional().default('recent'),
});

type FetchManagedCoursesSchema = z.infer<typeof fetchManagedCoursesSchema>;

const validationPipe = new ZodValidationPipe(fetchManagedCoursesSchema);

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('/courses/managed')
export class FetchCreatorCoursesController {
  constructor(private fetchCreatorCourses: FetchCreatorCoursesUseCase) {}

  @Get()
  @ApiOperation({ summary: 'List courses managed by the authenticated user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ type: FetchManagedCoursesQueryDto })
  async handle(
    @Query(validationPipe) params: FetchManagedCoursesSchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { page, orderBy } = params;
    const perPage = 20;

    const result = await this.fetchCreatorCourses.execute({
      creatorId: user.sub,
      page,
      perPage,
      orderBy,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const { courses } = result.value;

    return {
      courses: courses.map(CoursePresenter.toHTTP),
    };
  }
}

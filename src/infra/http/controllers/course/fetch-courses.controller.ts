import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { FetchCoursesUseCase } from 'src/domain/youcourse/application/use-cases/course/fetch-courses';
import z from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CoursePresenter } from '../../presenters/course-presenter';
import { Public } from 'src/infra/auth/public';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiProperty,
  ApiQuery,
} from '@nestjs/swagger';

export class FetchCoursesQueryDto {
  @ApiProperty({ required: false, default: 1 })
  page?: number;

  @ApiProperty({
    required: false,
    default: 'recent',
    enum: ['recent', 'popular', 'bestSelling'],
  })
  orderBy?: 'recent' | 'popular' | 'bestSelling';
}

const fetchCoursesBodySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().min(1)),
  orderBy: z
    .enum(['recent', 'popular', 'bestSelling'])
    .optional()
    .default('recent'),
});

type FetchCoursesBodySchema = z.infer<typeof fetchCoursesBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(fetchCoursesBodySchema);

@ApiTags('Courses')
@Controller('/courses')
export class FetchCoursesController {
  constructor(private fetchCourses: FetchCoursesUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Endpoint operation' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiQuery({ type: FetchCoursesQueryDto })
  @Public()
  async handle(@Query(bodyValidationPipe) params: FetchCoursesBodySchema) {
    const { page, orderBy } = params;
    const perPage = 20;

    const result = await this.fetchCourses.execute({
      page,
      perPage,
      orderBy,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const courses = result.value.visibleCourses;

    return { courses: courses.map(CoursePresenter.toHTTP) };
  }
}

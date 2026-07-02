import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { FetchEnrolledCoursesUseCase } from 'src/domain/youcourse/application/use-cases/enrollment/fetch-enrolled-courses';
import z from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CoursePresenter } from '../../presenters/course-presenter';
import { CurrentUser } from '../../../auth/current-user.decorator';
import type { UserPayload } from '../../../auth/jwt.strategy';

const fetchEnrolledCoursesBodySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().min(1)),
});

type FetchEnrolledCoursesBodySchema = z.infer<typeof fetchEnrolledCoursesBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(fetchEnrolledCoursesBodySchema);

@Controller('/enrollments/me')
export class FetchEnrolledCoursesController {
  constructor(private fetchEnrolledCourses: FetchEnrolledCoursesUseCase) { }

  @Get()
  async handle(
    @Query(bodyValidationPipe) params: FetchEnrolledCoursesBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { page } = params;
    const perPage = 20;

    const result = await this.fetchEnrolledCourses.execute({
      studentId: user.sub,
      page,
      perPage,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const courses = result.value.courses;

    return { courses: courses.map(CoursePresenter.toHTTP) };
  }
}

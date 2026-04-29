import {
  BadRequestException,
  Controller,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { PurchaseCourseUseCase } from 'src/domain/youcourse/application/use-cases/course/purchase-course';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import type { UserPayload } from 'src/infra/auth/jwt.strategy';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('/courses/:courseId/purchase')
export class PurchaseCourseController {
  constructor(private purchaseCourse: PurchaseCourseUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Generate a payment link for a course' })
  @ApiResponse({ status: 201, description: 'Link generated successfully' })
  @ApiResponse({ status: 400, description: 'Course not sellable or not found' })
  @ApiParam({ name: 'courseId', description: 'ID of the course to buy' })
  @HttpCode(201)
  async handle(
    @Param('courseId') courseId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const accountId = user.sub;

    const result = await this.purchaseCourse.execute({
      accountId,
      courseId,
    });

    if (result.isLeft()) {
      throw new BadRequestException('Could not initiate purchase');
    }

    return {
      paymentUrl: result.value.paymentUrl,
    };
  }
}

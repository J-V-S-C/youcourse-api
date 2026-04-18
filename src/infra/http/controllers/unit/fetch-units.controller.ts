import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { FetchUnitsUseCase } from 'src/domain/youcourse/application/use-cases/unit/fetch-units';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Units')
@Controller('/courses/:courseId/units')
export class FetchUnitsController {
  constructor(private fetchUnits: FetchUnitsUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Fetch all units of a course' })
  @ApiResponse({ status: 200, description: 'Units fetched successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @HttpCode(200)
  async handle(@Param('courseId') courseId: string) {
    const result = await this.fetchUnits.execute({ courseId });

    if (result.isLeft()) {
      const error = result.value;
      if (error.message.includes('Course')) {
        throw new Error('Course not found');
      }
      throw new Error('Cannot fetch units');
    }

    const units = result.value.units;

    return {
      units: units.map((unit) => ({
        id: unit.id.toString(),
        name: unit.name,
        description: unit.description,
        position: unit.position,
        courseId: unit.courseId.toString(),
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt,
      })),
    };
  }
}
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { RequestPasswordResetUseCase } from 'src/domain/youcourse/application/use-cases/account/request-password-reset';
import { Public } from 'src/infra/auth/public';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';

export class RequestPasswordResetDto {
  @ApiProperty({ default: 'user@example.com' })
  email!: string;
}

const requestPasswordResetBodySchema = z.object({
  email: z.string().email(),
});

type RequestPasswordResetBodySchema = z.infer<
  typeof requestPasswordResetBodySchema
>;

@ApiTags('Accounts')
@Controller('/accounts/password-reset')
@Public()
export class RequestPasswordResetController {
  constructor(private requestPasswordReset: RequestPasswordResetUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Endpoint operation' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @HttpCode(200)
  @ApiBody({ type: RequestPasswordResetDto })
  @UsePipes(new ZodValidationPipe(requestPasswordResetBodySchema))
  async handle(@Body() body: RequestPasswordResetBodySchema) {
    const { email } = body;

    const result = await this.requestPasswordReset.execute({
      email,
    });

    if (result.isLeft()) {
      const error = result.value;

      throw new BadRequestException(error.message);
    }
  }
}

import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
  UnauthorizedException,
  Body,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { RefreshTokenUseCase } from 'src/domain/youcourse/application/use-cases/auth/refresh-token';
import { Public } from 'src/infra/auth/public';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ default: 'refresh_token_here' })
  refreshToken!: string;
}

const refreshTokenBodySchema = z.object({
  refreshToken: z.string(),
});

type RefreshTokenBodySchema = z.infer<typeof refreshTokenBodySchema>;

@ApiTags('Refresh Token')
@Controller('/sessions/refresh')
@Public()
export class RefreshTokenController {
  constructor(private refreshTokenUserCase: RefreshTokenUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Endpoint operation' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @HttpCode(200)
  @ApiBody({ type: RefreshTokenDto })
  @UsePipes(new ZodValidationPipe(refreshTokenBodySchema))
  async handle(@Body() body: RefreshTokenBodySchema) {
    const { refreshToken } = body;

    const result = await this.refreshTokenUserCase.execute({
      refreshToken,
    });

    if (result.isLeft()) {
      const error = result.value;
      throw new UnauthorizedException(error.message);
    }

    const { accessToken, refreshToken: newRefreshToken } = result.value;

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }
}

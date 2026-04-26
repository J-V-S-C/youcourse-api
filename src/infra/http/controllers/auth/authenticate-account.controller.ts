import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common';
import { AccountAlreadyExistsError } from 'src/domain/youcourse/application/use-cases/errors/account-already-exists-error';
import z from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { AuthenticateAccountUseCase } from 'src/domain/youcourse/application/use-cases/auth/authenticate-account';
import { Public } from 'src/infra/auth/public';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';

export class AuthenticateAccountDto {
  @ApiProperty({ default: 'user@example.com' })
  email!: string;

  @ApiProperty({ default: '123456' })
  password!: string;
}

const authenticateAccountBodySchema = z.object({
  email: z.email().max(255),
  password: z.string().max(50),
});

type AuthenticateAccountBodySchema = z.infer<
  typeof authenticateAccountBodySchema
>;

@ApiTags('Accounts')
@Controller('/sessions')
@Public()
export class AuthenticateAccountController {
  constructor(private authenticate: AuthenticateAccountUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Endpoint operation' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @HttpCode(200)
  @ApiBody({ type: AuthenticateAccountDto })
  @UsePipes(new ZodValidationPipe(authenticateAccountBodySchema))
  async handle(@Body() body: AuthenticateAccountBodySchema) {
    const { email, password } = body;

    const result = await this.authenticate.execute({
      email,
      password,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case AccountAlreadyExistsError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    const { accessToken, refreshToken } = result.value;

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}

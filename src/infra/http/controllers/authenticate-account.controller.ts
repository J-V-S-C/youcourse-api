import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';
import { AccountAlreadyExistsError } from 'src/domain/ecommerce/application/use-cases/errors/account-already-exists-error';
import z from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { AuthenticateAccountUseCase } from 'src/domain/ecommerce/application/use-cases/authenticate-account';
import { Public } from 'src/infra/auth/public';
import { ApiBody, ApiProperty } from '@nestjs/swagger';
import type { Response } from 'express';
export class AuthenticateAccountDto {
  @ApiProperty({ default: 'user@example.com' })
  email: string;

  @ApiProperty({ default: '123456' })
  password: string;
}

const authenticateAccountBodySchema = z.object({
  email: z.email(),
  password: z.string(),
});

type AuthenticateAccountBodySchema = z.infer<
  typeof authenticateAccountBodySchema
>;

@Controller('/sessions')
@Public()
export class AuthenticateAccountController {
  constructor(private authenticate: AuthenticateAccountUseCase) {}

  @Post()
  @HttpCode(200)
  @ApiBody({ type: AuthenticateAccountDto })
  @UsePipes(new ZodValidationPipe(authenticateAccountBodySchema))
  async handle(
    @Body() body: AuthenticateAccountBodySchema,
    @Res({ passthrough: true }) response: Response,
  ) {
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

    const { accessToken } = result.value;

    return {
      access_token: accessToken,
    };
  }
}

/* LOGOUT
// src/infra/http/controllers/logout.controller.ts
import { Controller, HttpCode, Post, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('/sessions')
export class LogoutController {
  @Post('/logout')
  @HttpCode(200)
  async handle(@Res({ passthrough: true }) response: Response) {
    // 🗑️ Remove o cookie
    response.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return {
      success: true,
    };
  }
}
*/

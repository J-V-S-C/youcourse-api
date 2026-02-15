import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common';
import { AccountAlreadyExistsError } from 'src/domain/ecommerce/application/use-cases/errors/account-already-exists-error';
import { RegisterAccountUseCase } from 'src/domain/ecommerce/application/use-cases/register-account';
import z from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { Public } from 'src/infra/auth/public';
import { AccountPresenter } from '../presenters/account-presenter';
import { ApiBody, ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ default: 'user@example.com' })
  name!: string;

  @ApiProperty({ default: 'user@example.com' })
  email!: string;

  @ApiProperty({ default: '123456' })
  password!: string;
}

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string(),
});

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>;

@Controller('/accounts')
@Public()
export class CreateAccountController {
  constructor(private registerAccount: RegisterAccountUseCase) {}

  @Post()
  @ApiBody({ type: CreateAccountDto })
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createAccountBodySchema))
  async handle(@Body() body: CreateAccountBodySchema) {
    const { name, email, password } = body;

    const result = await this.registerAccount.execute({
      name,
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

    const account = result.value.account;

    return { account: AccountPresenter.toHTTP(account) };
  }
}

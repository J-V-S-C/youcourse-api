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
import { RegisterAccountUseCase } from 'src/domain/youcourse/application/use-cases/auth/register-account';
import z from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { Public } from 'src/infra/auth/public';
import { AccountPresenter } from '../presenters/account-presenter';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ default: 'user@example.com' })
  name!: string;

  @ApiProperty({ default: 'user@example.com' })
  email!: string;

  @ApiProperty({ default: '123456' })
  password!: string;
}

const createAccountBodySchema = z.object({
  name: z.string().max(50),
  email: z.email().max(255),
  password: z.string().max(50).min(6),
});

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>;

@ApiTags('Accounts')
@Controller('/accounts')
@Public()
export class CreateAccountController {
  constructor(private registerAccount: RegisterAccountUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Endpoint operation' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
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

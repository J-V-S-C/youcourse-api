import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  UsePipes,
} from '@nestjs/common';
import z from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { AccountPresenter } from '../presenters/account-presenter';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { EditAccountDetailsUseCase } from 'src/domain/youcourse/application/use-cases/account/edit-account-details';
import { ResourceNotFoundError } from 'src/domain/youcourse/application/use-cases/errors/resource-not-found-error';

export class EditAccountDto {
  @ApiProperty({ default: 'user@example.com' })
  name!: string;

  @ApiProperty({ default: 'user@example.com' })
  email!: string;
}

const editAccountBodySchema = z.object({
  name: z.string().max(50).optional(),
  email: z.email().max(255).optional(),
});

type EditAccountBodySchema = z.infer<typeof editAccountBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(editAccountBodySchema);

@ApiTags('Accounts')
@Controller('/accounts/:id')
export class EditAccountDetailsController {
  constructor(private editAccountDetails: EditAccountDetailsUseCase) {}

  @Patch()
  @ApiOperation({ summary: 'Endpoint operation' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: EditAccountDto })
  @HttpCode(200)
  async handle(
    @Param('id') accountId: string,
    @Body(bodyValidationPipe) body: EditAccountBodySchema,
  ) {
    const { name, email } = body;

    const result = await this.editAccountDetails.execute({
      accountId,
      name,
      email,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    const account = result.value.account;

    return { account: AccountPresenter.toHTTP(account) };
  }
}

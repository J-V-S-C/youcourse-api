import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { GetAccountByIdUseCase } from 'src/domain/youcourse/application/use-cases/account/get-account-by-id';
import { AccountPresenter } from '../../presenters/account-presenter';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import type { UserPayload } from 'src/infra/auth/jwt.strategy';

@ApiTags('Accounts')
@Controller('/accounts/:id')
export class GetAccountByIdController {
  constructor(private getAccountById: GetAccountByIdUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Endpoint operation' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async handle(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const result = await this.getAccountById.execute({
      id,
      requesterId: user.sub,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const { account } = result.value;

    return { account: AccountPresenter.toHTTP(account) };
  }
}

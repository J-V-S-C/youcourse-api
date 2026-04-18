import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { EditPasswordUseCase } from 'src/domain/youcourse/application/use-cases/account/edit-password';
import { Public } from 'src/infra/auth/public';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

export class EditPasswordDto {
  @ApiProperty({ default: 'reset_token_here' })
  token!: string;

  @ApiProperty({ default: 'new_password123' })
  newPassword!: string;
}

const editPasswordBodySchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6),
});

type EditPasswordBodySchema = z.infer<typeof editPasswordBodySchema>;

@ApiTags('Accounts')
@UseGuards(ThrottlerGuard)
@Controller('/accounts/password')
@Public()
export class EditPasswordController {
  constructor(private editPassword: EditPasswordUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Endpoint operation' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @HttpCode(200)
  @ApiBody({ type: EditPasswordDto })
  @UsePipes(new ZodValidationPipe(editPasswordBodySchema))
  async handle(@Body() body: EditPasswordBodySchema) {
    const { token, newPassword } = body;

    const result = await this.editPassword.execute({
      token,
      newPassword,
    });

    if (result.isLeft()) {
      const error = result.value;
      throw new BadRequestException(error.message);
    }
  }
}

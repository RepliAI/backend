import { Body, Controller, Post } from '@nestjs/common';
import { RegisterUserUseCase } from '../../../../application/users/use-cases/register-user.usecase';
import { RegisterUserRequestDto } from '../dto/register-user.dto';
import { RegisterUserInput } from '../../../../application/users/dto/register-user.input';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterUserRequestDto) {
    const input: RegisterUserInput = {
      email: dto.email,
      password: dto.password,
    };

    await this.registerUserUseCase.execute(input);

    return { message: 'User created' };
  }
}

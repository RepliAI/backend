import { Body, ConflictException, Controller, Post } from '@nestjs/common';
import { RegisterUserRequestDto } from '../dto/register-user.dto';
import { RegisterUserUseCase } from 'src/application/users/use-cases/register-user.usecase';
import { RegisterUserInput } from 'src/application/users/dto/register-user.input';
import { UserAlreadyExistsError } from 'src/domain/shared/errors/user-already-exist.error';

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

    try {
      await this.registerUserUseCase.execute(input);
      return { message: 'User created' };
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }
}

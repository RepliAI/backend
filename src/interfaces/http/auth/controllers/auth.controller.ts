import { Body, ConflictException, Controller, Post } from '@nestjs/common';

import { RegisterUserUseCase } from 'src/application/users/use-cases/register-user.usecase';
import { RegisterUserInput } from 'src/application/users/dto/register-user.input';
import { UserAlreadyExistsError } from 'src/domain/shared/errors/user-already-exist.errors';
import { LoginUserUseCase } from 'src/application/users/use-cases/login-user.usercase';
import { RefreshTokensUseCase } from 'src/application/users/use-cases/refresh-token.usecase';
import { RegisterUserRequestDto } from '../dto/register-user.dto';
import { ForgotPasswordUseCase } from 'src/application/auth/use-cases/forgot-password.usecase';
import { ResetPasswordUseCase } from 'src/application/auth/use-cases/reset-password.usecase';

import { LoginRequestDto } from '../dto/login.dto';
import { RefreshTokenRequestDto } from '../dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly registerUserUseCase: RegisterUserUseCase,
        private readonly loginUserUseCase: LoginUserUseCase,
        private readonly refreshTokensUseCase: RefreshTokensUseCase,
        private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
        private readonly resetPasswordUseCase: ResetPasswordUseCase,
    ) { }

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

    @Post('login')
    async login(@Body() dto: LoginRequestDto) {
        return this.loginUserUseCase.execute({
            email: dto.email,
            password: dto.password,
        });
    }

    @Post('refresh')
    async refresh(@Body() dto: RefreshTokenRequestDto) {
        return this.refreshTokensUseCase.execute(dto.refreshToken);
    }
    @Post("forgot-password")
    async forgotPassword(@Body() body: { email: string }) {
        await this.forgotPasswordUseCase.execute(body.email);
        return { success: true }
    }

    @Post("reset-password")
    async resetPassword(@Body() body: { token: string; password: string }) {
        await this.resetPasswordUseCase.execute(body.token, body.password);
        return { success: true }
    }
}

import { Body, ConflictException, Controller, Post, UseGuards } from '@nestjs/common';

import { RegisterUserUseCase } from 'src/application/users/use-cases/register-user.usecase';
import { RegisterUserInput } from 'src/application/users/dto/register-user.input';
import { UserAlreadyExistsError } from 'src/domain/shared/errors/user-already-exist.errors';
import { LoginUserUseCase } from 'src/application/users/use-cases/login-user.usecase';
import { RefreshTokensUseCase } from 'src/application/users/use-cases/refresh-token.usecase';
import { ForgotPasswordUseCase } from 'src/application/auth/use-cases/forgot-password.usecase';
import { ResetPasswordUseCase } from 'src/application/auth/use-cases/reset-password.usecase';
import { ChangeEmailConfirmUseCase } from 'src/application/users/use-cases/change-email-confirm.usecase';

import { SuccessResponse } from '../../shared/types/http-response.interface';
import { RegisterUserRequestDto } from '../dto/register-user.dto';
import { LoginRequestDto } from '../dto/login.dto';
import { RefreshTokenRequestDto } from '../dto/refresh-token.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ConfirmEmailChangeDto } from '../dto/confirm-email-change.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly registerUserUseCase: RegisterUserUseCase,
        private readonly loginUserUseCase: LoginUserUseCase,
        private readonly refreshTokensUseCase: RefreshTokensUseCase,
        private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
        private readonly resetPasswordUseCase: ResetPasswordUseCase,
        private readonly changeEmailConfirmUseCase: ChangeEmailConfirmUseCase,
    ) { }

    @Post('register')
    async register(@Body() dto: RegisterUserRequestDto): Promise<SuccessResponse<{ message: string }>> {
        const input: RegisterUserInput = {
            email: dto.email,
            password: dto.password,
        };

        try {
            await this.registerUserUseCase.execute(input);
            return { success: true, data: { message: 'User created' } };
        } catch (error) {
            if (error instanceof UserAlreadyExistsError) {
                throw new ConflictException(error.message);
            }
            throw error;
        }
    }

    @Post('login')
    async login(@Body() dto: LoginRequestDto): Promise<{ accessToken: string; refreshToken: string }> {
        return this.loginUserUseCase.execute({
            email: dto.email,
            password: dto.password,
        });
    }

    @Post('refresh')
    async refresh(@Body() dto: RefreshTokenRequestDto): Promise<{ accessToken: string; refreshToken: string }> {
        return this.refreshTokensUseCase.execute(dto.refreshToken);
    }

    @Post("forgot-password")
    async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<SuccessResponse> {
        await this.forgotPasswordUseCase.execute(dto.email);
        return { success: true };
    }

    @Post("reset-password")
    async resetPassword(@Body() dto: ResetPasswordDto): Promise<SuccessResponse> {
        await this.resetPasswordUseCase.execute(dto.token, dto.password);
        return { success: true };
    }


    @Post("confirm-email-change")
    async confirmEmailChange(@Body() dto: ConfirmEmailChangeDto): Promise<SuccessResponse> {
        await this.changeEmailConfirmUseCase.execute(dto.token);
        return { success: true };
    }
}
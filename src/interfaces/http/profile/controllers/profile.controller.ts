import { Controller, Get, Post, Delete, Body, UseGuards } from '@nestjs/common';

import { GetProfileUseCase } from 'src/application/users/use-cases/get-profile.usecase';
import { ChangeEmailRequestUseCase } from 'src/application/users/use-cases/change-email-request.usecase';
import { DeleteAccountUseCase } from 'src/application/users/use-cases/delete-account.usecase';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/security/jwt-auth.guard';
import { CurrentUser as CurrentUserType } from '../../shared/types/current-user.interface';
import { ChangeEmailRequestDto } from '../dto/change-email-request.dto';
import { SuccessResponse } from '../../shared/types/http-response.interface';

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
    constructor(
        private readonly getProfileUseCase: GetProfileUseCase,
        private readonly changeEmailRequestUseCase: ChangeEmailRequestUseCase,
        private readonly deleteAccountUseCase: DeleteAccountUseCase,
    ) { }

    @Get()
    async getProfile(@CurrentUser() user: CurrentUserType) {
        return this.getProfileUseCase.execute(user.userId);
    }

    @Post('change-email-request')
    async changeEmailRequest(
        @CurrentUser() user: CurrentUserType,
        @Body() dto: ChangeEmailRequestDto,
    ): Promise<SuccessResponse> {
        await this.changeEmailRequestUseCase.execute(user.userId, dto.newEmail);
        return { success: true };
    }

    @Delete()
    async deleteAccount(@CurrentUser() user: CurrentUserType): Promise<SuccessResponse> {
        await this.deleteAccountUseCase.execute(user.userId);
        return { success: true };
    }
}
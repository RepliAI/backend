import { Controller, Get, Query, UseGuards, Post, Res } from '@nestjs/common';
import { Response } from 'express';

import { ImportEmailsUseCase } from 'src/application/gmail/use-cases/import-emails.usecase';
import { GetGmailAuthUrlUseCase } from 'src/application/gmail/use-cases/get-gmail-auth-url.usecase';
import { HandleGmailCallbackUseCase } from 'src/application/gmail/use-cases/handle-gmail-callback.usecase';
import { GetGmailAuthUrlInput } from 'src/application/gmail/dto/get-gmail-url.dto';
import { HandleGmailCallbackInput } from 'src/application/gmail/dto/handle-gmail-callback.dto';
import { ImportEmailsInput } from 'src/application/gmail/dto/import-email.dto';

import { JwtAuthGuard } from '../auth/security/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GetGmailStatusUseCase } from 'src/application/gmail/use-cases/get-gmail-status.usecase';
import { CurrentUser as CurrentUserType } from '../shared/types/current-user.interface';

@Controller('gmail')
export class GmailController {
    constructor(
        private readonly getAuthUrlUseCase: GetGmailAuthUrlUseCase,
        private readonly handleCallbackUseCase: HandleGmailCallbackUseCase,
        private readonly importEmailsUseCase: ImportEmailsUseCase,
        private readonly getGmailStatusUseCase: GetGmailStatusUseCase,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get('connect')
    async connect(@CurrentUser() user: CurrentUserType): Promise<{ url: string }> {
        const input = new GetGmailAuthUrlInput();
        input.userId = user.userId;
        const output = await this.getAuthUrlUseCase.execute(input);
        return { url: output.url };
    }

    @Get("callback")
    async callback(
        @Query("code") code: string,
        @Query("state") userId: string,
        @Res() res: Response
    ): Promise<void> {
        const input = new HandleGmailCallbackInput();
        input.code = code;
        input.stateUserId = userId;
        await this.handleCallbackUseCase.execute(input);

        res.redirect(`${process.env.FRONTEND_URL}/gmail/connected`);
    }

    @UseGuards(JwtAuthGuard)
    @Post('import')
    async import(@CurrentUser() user: CurrentUserType): Promise<{ imported: number }> {
        const input = new ImportEmailsInput();
        input.userId = user.userId;
        const output = await this.importEmailsUseCase.execute(input);

        return { imported: output.imported };
    }

    @UseGuards(JwtAuthGuard)
    @Get("status")
    async status(@CurrentUser() user: CurrentUserType): Promise<{ connected: boolean }> {
        const result = await this.getGmailStatusUseCase.execute(user.userId);
        return result;
    }
}
import { Controller, Get, Query, UseGuards, Post } from '@nestjs/common';

import { ImportEmailsUseCase } from 'src/application/gmail/use-cases/import-emails.usecase';
import { GetGmailAuthUrlUseCase } from 'src/application/gmail/use-cases/get-gmail-auth-url.usecase';
import { HandleGmailCallbackUseCase } from 'src/application/gmail/use-cases/handle-gmail-callback.usecase';
import { GetGmailAuthUrlInput } from 'src/application/gmail/dto/get-gmail-url.dto';
import { HandleGmailCallbackInput } from 'src/application/gmail/dto/handle-gmail-callback.dto';
import { ImportEmailsInput } from 'src/application/gmail/dto/import-email.dto';

import { JwtAuthGuard } from '../auth/security/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('gmail')
export class GmailController {
    constructor(
        private readonly getAuthUrlUseCase: GetGmailAuthUrlUseCase,
        private readonly handleCallbackUseCase: HandleGmailCallbackUseCase,
        private readonly importEmailsUseCase: ImportEmailsUseCase,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get('connect')
    async connect(@CurrentUser() user: any) {
        const userId = user.userId;
        const url = await this.getAuthUrlUseCase.execute(new GetGmailAuthUrlInput(userId));
        return { url: url.url };
    }

    @Get('callback')
    async callback(@Query('code') code: string, @Query('state') state: string) {
        await this.handleCallbackUseCase.execute(new HandleGmailCallbackInput(code, state));
        return { success: true };
    }

    @UseGuards(JwtAuthGuard)
    @Post('import')
    async import(@CurrentUser() user: any) {
        const out = await this.importEmailsUseCase.execute(
            new ImportEmailsInput(user.userId),
        );

        return { imported: out.imported };
    }
}
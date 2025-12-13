import { Module } from '@nestjs/common';

import { GmailInfrastructureModule } from 'src/infrastructure/gmail/gmail-infrastructure.module';
import { TicketsInfrastructureModule } from 'src/infrastructure/tickets/tickets-infrastructure.module';
import { IdGeneratorModule } from 'src/infrastructure/shared/id-generator/id-generator.module';

import { GetGmailAuthUrlUseCase } from './use-cases/get-gmail-auth-url.usecase';
import { HandleGmailCallbackUseCase } from './use-cases/handle-gmail-callback.usecase';
import { ImportEmailsUseCase } from './use-cases/import-emails.usecase';
import { GetGmailStatusUseCase } from './use-cases/get-gmail-status.usecase';

@Module({
    imports: [
        GmailInfrastructureModule,
        TicketsInfrastructureModule,
        IdGeneratorModule,
    ],
    providers: [
        GetGmailAuthUrlUseCase,
        HandleGmailCallbackUseCase,
        ImportEmailsUseCase,
        GetGmailStatusUseCase,
    ],
    exports: [
        GetGmailAuthUrlUseCase,
        HandleGmailCallbackUseCase,
        ImportEmailsUseCase,
        GetGmailStatusUseCase,
    ],
})
export class GmailApplicationModule { }
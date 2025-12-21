import { Module } from '@nestjs/common';

import { GmailInfrastructureModule } from 'src/infrastructure/gmail/gmail-infrastructure.module';
import { TicketsInfrastructureModule } from 'src/infrastructure/tickets/tickets-infrastructure.module';
import { IdGeneratorModule } from 'src/infrastructure/shared/id-generator/id-generator.module';
import { PlansApplicationModule } from 'src/application/plans/plan-application.module';
import { TicketsApplicationModule } from 'src/application/tickets/tickets-application.module';
import { WebSocketModule } from 'src/infrastructure/websocket/websocket.module';
import { OpenAiModule } from 'src/infrastructure/integrations/openai/openai.module';

import { GetGmailAuthUrlUseCase } from './use-cases/get-gmail-auth-url.usecase';
import { HandleGmailCallbackUseCase } from './use-cases/handle-gmail-callback.usecase';
import { ImportEmailsUseCase } from './use-cases/import-emails.usecase';
import { GetGmailStatusUseCase } from './use-cases/get-gmail-status.usecase';
import { GetEligibleUsersForImportUseCase } from './use-cases/get-eligible-users-for-import.usecase';

@Module({
    imports: [
        GmailInfrastructureModule,
        TicketsInfrastructureModule,
        IdGeneratorModule,
        PlansApplicationModule,
        TicketsApplicationModule,
        WebSocketModule,
        OpenAiModule,
    ],
    providers: [
        GetGmailAuthUrlUseCase,
        HandleGmailCallbackUseCase,
        ImportEmailsUseCase,
        GetGmailStatusUseCase,
        GetEligibleUsersForImportUseCase,
    ],
    exports: [
        GetGmailAuthUrlUseCase,
        HandleGmailCallbackUseCase,
        ImportEmailsUseCase,
        GetGmailStatusUseCase,
        GetEligibleUsersForImportUseCase,
    ],
})
export class GmailApplicationModule { }
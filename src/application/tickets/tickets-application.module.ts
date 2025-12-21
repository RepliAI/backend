import { Module } from '@nestjs/common';

import { TicketsInfrastructureModule } from 'src/infrastructure/tickets/tickets-infrastructure.module';
import { OpenAiModule } from 'src/infrastructure/integrations/openai/openai.module';
import { IdGeneratorModule } from 'src/infrastructure/shared/id-generator/id-generator.module';
import { GmailModule } from 'src/infrastructure/integrations/gmail/gmail.module';
import { UserPreferencesInfrastructureModule } from 'src/infrastructure/user-preferences/user-preference-infrastructure.module';
import { PlansApplicationModule } from 'src/application/plans/plan-application.module';
import { WebSocketModule } from 'src/infrastructure/websocket/websocket.module';


import { ListTicketsUseCase } from './use-cases/list-tickets.usecase';
import { GetTicketByIdUseCase } from './use-cases/get-ticket.usecase';
import { GenerateAiReplyUseCase } from './use-cases/generate-ai-reply.usecase';
import { CreateTicketUseCase } from './use-cases/create-ticket.usecase';
import { AddMessageToTicketUseCase } from './use-cases/add-message.usecase';
import { UpdateTicketStatusUseCase } from './use-cases/update-status.usecase';
import { AutoReplyToTicketUseCase } from './use-cases/auto-reply-to-ticket.usecase';
import { UserPreferencesApplicationModule } from '../user-preferences/user-preferences-application.module';

@Module({
  imports: [
    GmailModule,
    TicketsInfrastructureModule,
    OpenAiModule,
    IdGeneratorModule,
    UserPreferencesInfrastructureModule,
    PlansApplicationModule,
    UserPreferencesApplicationModule,
    WebSocketModule,
  ],
  providers: [
    ListTicketsUseCase,
    GetTicketByIdUseCase,
    GenerateAiReplyUseCase,
    CreateTicketUseCase,
    AddMessageToTicketUseCase,
    UpdateTicketStatusUseCase,
    AutoReplyToTicketUseCase,
  ],
  exports: [
    ListTicketsUseCase,
    GetTicketByIdUseCase,
    GenerateAiReplyUseCase,
    CreateTicketUseCase,
    AddMessageToTicketUseCase,
    UpdateTicketStatusUseCase,
    AutoReplyToTicketUseCase,
  ],
})

export class TicketsApplicationModule {}
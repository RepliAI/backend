import { Module } from '@nestjs/common';
import { TicketsInfrastructureModule } from 'src/infrastructure/tickets/tickets-infrastructure.module';
import { OpenAiModule } from 'src/infrastructure/integrations/openai/openai.module';
import { IdGeneratorModule } from 'src/infrastructure/shared/id-generator/id-generator.module';
import { ListTicketsUseCase } from './use-cases/list-tickets.usecase';
import { GetTicketByIdUseCase } from './use-cases/get-ticket.usecase';
import { GenerateAiReplyUseCase } from './use-cases/generate-ai-reply.usecase';
import { CreateTicketUseCase } from './use-cases/create-ticket.usecase';
import { AddMessageToTicketUseCase } from './use-cases/add-message.usecase';
import { UpdateTicketStatusUseCase } from './use-cases/update-status.usecase';
import { GmailModule } from 'src/infrastructure/integrations/gmail/gmail.module';

@Module({
  imports: [
    GmailModule,
    TicketsInfrastructureModule,
    OpenAiModule,
    IdGeneratorModule
  ],
  providers: [
    ListTicketsUseCase,
    GetTicketByIdUseCase,
    GenerateAiReplyUseCase,
    CreateTicketUseCase,
    AddMessageToTicketUseCase,
    UpdateTicketStatusUseCase,
  ],
  exports: [
    ListTicketsUseCase,
    GetTicketByIdUseCase,
    GenerateAiReplyUseCase,
    CreateTicketUseCase,
    AddMessageToTicketUseCase,
    UpdateTicketStatusUseCase,
  ],
})
export class TicketsApplicationModule {}
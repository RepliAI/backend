import { Module } from '@nestjs/common';
import { TicketsInfrastructureModule } from 'src/infrastructure/tickets/tickets-infrastructure.module';
import { OpenAiModule } from 'src/infrastructure/integrations/openai/openai.module';
import { IdGeneratorModule } from 'src/infrastructure/shared/id-generator/id-generator.module';
import { ListTicketsUseCase } from './use-cases/list-tickets.usecase';
import { GetTicketByIdUseCase } from './use-cases/get-ticket.usecase';
import { GenerateAiReplyUseCase } from './use-cases/generate-ai-reply.usecase';

@Module({
  imports: [
    TicketsInfrastructureModule,
    OpenAiModule,
    IdGeneratorModule
  ],
  providers: [
    ListTicketsUseCase,
    GetTicketByIdUseCase,
    GenerateAiReplyUseCase,
  ],
  exports: [
    ListTicketsUseCase,
    GetTicketByIdUseCase,
    GenerateAiReplyUseCase
  ],
})
export class TicketsApplicationModule {}

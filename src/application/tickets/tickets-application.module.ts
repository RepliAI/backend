import { Module } from '@nestjs/common';
import { TicketsInfrastructureModule } from 'src/infrastructure/tickets/tickets-infrastructure.module';
import { ListTicketsUseCase } from './use-cases/list-tickets.usecase';
import { GetTicketByIdUseCase } from './use-cases/get-ticket.usecase';

@Module({
  imports: [TicketsInfrastructureModule],
  providers: [
    ListTicketsUseCase,
    GetTicketByIdUseCase,
  ],
  exports: [
    ListTicketsUseCase,
    GetTicketByIdUseCase,
  ],
})
export class TicketsApplicationModule {}

import { Module } from '@nestjs/common';
import { TicketsController } from './controllers/ticket.controller';
import { TicketsApplicationModule } from 'src/application/tickets/tickets-application.module';
import { TicketsInfrastructureModule } from 'src/infrastructure/tickets/tickets-infrastructure.module';

@Module({
  imports: [
    TicketsApplicationModule,
    TicketsInfrastructureModule,
  ],
  controllers: [TicketsController],
})
export class TicketsModule {}
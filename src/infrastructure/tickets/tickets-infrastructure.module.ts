import { Module } from '@nestjs/common';
import { TICKET_REPOSITORY } from 'src/domain/tickets/repositories/ticket.repository';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaTicketRepository } from '../repositories/prisma-ticket.repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: TICKET_REPOSITORY,
      useClass: PrismaTicketRepository,
    },
  ],
  exports: [
    PrismaService,
    {
      provide: TICKET_REPOSITORY,
      useClass: PrismaTicketRepository,
    },
  ],
})
export class TicketsInfrastructureModule {}

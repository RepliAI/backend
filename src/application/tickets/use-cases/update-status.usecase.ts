import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITicketRepository, TICKET_REPOSITORY } from 'src/domain/tickets/repositories/ticket.repository';
import { TicketStatus } from 'src/domain/tickets/value-objects/ticket-status.vo';

@Injectable()
export class UpdateTicketStatusUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(id: string, userId: string, status: TicketStatus) {
    const ticket = await this.ticketRepository.findById(id, userId);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    ticket.status = status;

    await this.ticketRepository.update(ticket);

    return ticket;
  }
}
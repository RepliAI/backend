import { Inject, NotFoundException } from '@nestjs/common';
import { ITicketRepository, TICKET_REPOSITORY } from 'src/domain/tickets/repositories/ticket.repository';
import { Ticket } from 'src/domain/tickets/entities/ticket.entity';

export class GetTicketByIdUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(ticketId: string, userId: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(ticketId, userId);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }
}

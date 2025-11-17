import { Inject, NotFoundException } from '@nestjs/common';
import { ITicketRepository, TICKET_REPOSITORY } from '../../../domain/tickets/repositories/ticket.repository';
import { TicketMapper } from '../mappers/ticket.mapper';
import { TicketDetailOutput } from '../dto/get-tickets.output';

export class GetTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(ticketId: string, userId: string): Promise<TicketDetailOutput> {
    const ticket = await this.ticketRepository.findById(ticketId, userId);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return TicketMapper.toDetail(ticket);
  }
}

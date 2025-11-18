import { Inject } from "@nestjs/common";
import { ITicketRepository, TICKET_REPOSITORY } from "src/domain/tickets/repositories/ticket.repository";
import { Ticket } from 'src/domain/tickets/entities/ticket.entity';

export class ListTicketsUseCase {
    constructor(
        @Inject(TICKET_REPOSITORY)
        private readonly ticketRepository: ITicketRepository,
    ){}

    async execute(userId: string): Promise<Ticket[]> {
        return this.ticketRepository.findAllByUser(userId);
    }
}
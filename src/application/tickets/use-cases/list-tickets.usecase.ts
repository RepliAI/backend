import { Inject } from "@nestjs/common";
import { ITicketRepository, TICKET_REPOSITORY } from "src/domain/tickets/repositories/ticket.repository";
import { TicketListItemOutput } from "../dto/list-tickets.output";
import { TicketMapper } from "../mappers/ticket.mapper";

export class ListTicketUseCase {
    constructor(
        @Inject(TICKET_REPOSITORY)
        private readonly ticketRepository: ITicketRepository,
    ){}

    async execute(userId: string): Promise<TicketListItemOutput[]> {
        const tickets = await this.ticketRepository.findAllByUser(userId);
        return tickets.map(TicketMapper.toListItem);
    }
}
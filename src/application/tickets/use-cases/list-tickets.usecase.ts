import { Inject } from "@nestjs/common";
import { ITicketRepository, TICKET_REPOSITORY } from "src/domain/tickets/repositories/ticket.repository";
import { ListTicketsInput } from "../dto/list-ticket.input";
import { PaginatedTicketsOutput } from "../dto/list-ticket.output";

export class ListTicketsUseCase {
    constructor(
        @Inject(TICKET_REPOSITORY)
        private readonly ticketRepository: ITicketRepository,
    ){}

    async execute(input: ListTicketsInput): Promise<PaginatedTicketsOutput> {
      const page = Number(input.page) > 0 ? Number(input.page) : 1;
      const pageSize = Number(input.pageSize) > 0 ? Number(input.pageSize) : 10;
    
        const { items, total } = await this.ticketRepository.listWithFilters({
            userId: input.userId,
            status: input.status,
            search: input.search,
            page,
            pageSize,
            from: input.from,
            to: input.to,

        });
    
        return {
          items,
          total,
          page,
          pageSize,
        };
      }
}
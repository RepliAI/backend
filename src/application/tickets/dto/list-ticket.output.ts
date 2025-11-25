import { Ticket } from 'src/domain/tickets/entities/ticket.entity';

export class PaginatedTicketsOutput {
  items: Ticket[];
  total: number;
  page: number;
  pageSize: number;
}
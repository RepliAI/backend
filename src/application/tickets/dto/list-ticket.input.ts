import { TicketStatus } from 'src/domain/tickets/value-objects/ticket-status.vo';

export class ListTicketsInput {
  userId: string;
  status?: TicketStatus;
  search?: string;
  page?: number;
  pageSize?: number;
  from?: Date;
  to?: Date;
}
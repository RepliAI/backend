import { Message } from "../entities/message.entity";
import { Ticket } from "../entities/ticket.entity";
import { TicketStatus } from '../value-objects/ticket-status.vo';

export const TICKET_REPOSITORY = 'TICKET_REPOSITORY';

export interface ListTicketsParams {
  userId: string;
  status?: TicketStatus;
  search?: string;
  page: number;
  pageSize: number;
  from?: Date;
  to?: Date;
}

export interface PaginatedTicketsResult {
  items: Ticket[];
  total: number;
}
export interface ITicketRepository {
  findAllByUser(userId: string): Promise<Ticket[]>;
  findById(id: string, userId: string): Promise<Ticket | null>;
  create(ticket: Ticket): Promise<void>;
  update(ticket: Ticket): Promise<void>;
  listWithFilters(params: ListTicketsParams): Promise<PaginatedTicketsResult>
  findBySubjectAndUser(subject: string, userId: string): Promise<Ticket | null>;
  findMessageByGmailId(gmailId: string): Promise<Message | null>;
  addMessage(ticketId: string, message: Message): Promise<void>
  updateStatus(ticketId: string, status: string): Promise<void>;
  findByThreadId(threadId: string): Promise<Ticket | null>;
}
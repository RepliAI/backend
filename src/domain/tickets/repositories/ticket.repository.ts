import { Ticket } from "../entitites/ticket.entity";

export const TICKET_REPOSITORY = 'TICKET_REPOSITORY';

export interface ITicketRepository {
  findAllByUser(userId: string): Promise<Ticket[]>;
  findById(id: string, userId: string): Promise<Ticket | null>;
  create(ticket: Ticket): Promise<void>;
}
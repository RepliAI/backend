import { Ticket } from 'src/domain/tickets/entities/ticket.entity';
import { Message } from '../../../domain/tickets/entities/message.entity';
import { TicketStatus } from '../../../domain/tickets/value-objects/ticket-status.vo';

export class PrismaTicketMapper {
  static toDomain(raw: any): Ticket {
    return new Ticket(
      raw.id,
      raw.userId,
      raw.subject,
      raw.status as TicketStatus,
      raw.createdAt,
      raw.messages?.map(
        (message: any) =>
          new Message(
            message.id,
            message.ticketId,
            message.from,
            message.to,
            message.content,
            new Date(message.date)
          )
      ) ?? [],
    );
  }
}

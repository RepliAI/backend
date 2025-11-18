import { Ticket } from 'src/domain/tickets/entities/ticket.entity';
import { Message } from 'src/domain/tickets/entities/message.entity';

export class PrismaTicketMapper {
  static toDomain(raw: any): Ticket {
    return new Ticket(
      raw.id,
      raw.userId,
      raw.subject,
      raw.status,
      raw.createdAt,
      (raw.messages ?? []).map(
        (message: any) =>
          new Message(
            message.id,
            message.ticketId,
            message.from,
            message.to,
            message.content,
            new Date(message.date)
          )
      ),
    );
  }
}

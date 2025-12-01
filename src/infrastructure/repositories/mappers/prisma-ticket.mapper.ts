import { Ticket } from 'src/domain/tickets/entities/ticket.entity';
import { Message } from 'src/domain/tickets/entities/message.entity';

export class PrismaTicketMapper {
  static toDomain(raw: any): Ticket {
    const messages = raw.messages?.map((message: any) => 
      new Message(
        message.id,
        raw.id,
        message.gmailId,
        message.from,
        message.to,
        message.content,
        message.date,
        message.threadId  
      )
    ) ?? [];

    return new Ticket(
      raw.id,
      raw.userId,
      raw.subject,
      raw.status,
      raw.createdAt,
      messages,
    );
  }
}
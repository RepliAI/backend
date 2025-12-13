import { Ticket as TicketEntity } from 'src/domain/tickets/entities/ticket.entity';
import { Message as MessageEntity } from 'src/domain/tickets/entities/message.entity';
import { Ticket } from '../../shared/types/ticket.type';
import { Message } from '../../shared/types/message.type';

export class PrismaTicketMapper {
  static toDomain(raw: Ticket): TicketEntity {
    const messages = raw.messages?.map((message: Message) =>
      new MessageEntity(
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

    return new TicketEntity(
      raw.id,
      raw.userId,
      raw.subject,
      raw.status,
      raw.createdAt,
      messages,
    );
  }
}
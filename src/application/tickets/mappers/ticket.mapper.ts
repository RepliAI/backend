import { Ticket } from 'src/domain/tickets/entitites/ticket.entity';
import { TicketMessageOutput, TicketDetailOutput } from '../dto/get-tickets.output';
import { TicketListItemOutput } from '../dto/list-tickets.output';

export class TicketMapper {
  static toListItem(ticket: Ticket): TicketListItemOutput {
    return new TicketListItemOutput({
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      createdAt: ticket.createdAt,
    });
  }

  static toDetail(ticket: Ticket): TicketDetailOutput {
    return new TicketDetailOutput({
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      createdAt: ticket.createdAt,
      messages: ticket.messages.map(
        message =>
          new TicketMessageOutput({
            id: message.id,
            from: message.from,
            to: message.to,
            content: message.content,
            date: message.date,
          }),
      ),
    });
  }
}

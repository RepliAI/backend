import { Ticket } from 'src/domain/tickets/entities/ticket.entity';

export class TicketResponseDto {
  id: string;
  subject: string;
  status: string;
  createdAt: Date;
  messages: {
    id: string;
    from: string;
    to: string;
    content: string;
    date: Date;
  }[];

  static fromDomain(ticket: Ticket): TicketResponseDto {
    if (!ticket) {
      return {
        id: '',
        subject: '',
        status: '',
        createdAt: new Date(),
        messages: [],
      };
    }

    return {
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      createdAt: ticket.createdAt,
      messages: (ticket.messages ?? []).map((m) => ({
        id: m.id,
        from: m.from,
        to: m.to,
        content: m.content,
        date: m.date,
      })),
    };
  }
}

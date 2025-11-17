import { TicketStatus } from '../value-objects/ticket-status.vo';
import { Message } from './message.entity';

export class Ticket {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public subject: string,
    public status: TicketStatus,
    public createdAt: Date,
    public messages: Message[] = [],
  ) {}

  addMessage(message: Message) {
    this.messages.push(message);
  }
}

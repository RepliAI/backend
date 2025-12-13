import { Message } from './message.entity';

export class Ticket {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public subject: string,
    public status: string,
    public readonly createdAt: Date,
    public messages: Message[] = [],
  ) {}

  addMessage(message: Message) {
    this.messages.push(message);
  }

  markPending() {
    this.status = "PENDING";
  }
}
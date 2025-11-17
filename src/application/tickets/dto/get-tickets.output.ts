import { TicketStatus } from '../../../domain/tickets/value-objects/ticket-status.vo';

export class TicketMessageOutput {
  id: string;
  from: string;
  to: string;
  content: string;
  date: Date;

  constructor(props: TicketMessageOutput) {
    Object.assign(this, props);
  }
}

export class TicketDetailOutput {
  id: string;
  subject: string;
  status: TicketStatus;
  createdAt: Date;
  messages: TicketMessageOutput[];

  constructor(props: TicketDetailOutput) {
    Object.assign(this, props);
  }
}

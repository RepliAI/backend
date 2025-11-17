export class TicketListItemOutput {
    id: string;
    subject: string;
    status: string;
    createdAt: Date;
  
    constructor(props: TicketListItemOutput) {
      Object.assign(this, props);
    }
  }
  
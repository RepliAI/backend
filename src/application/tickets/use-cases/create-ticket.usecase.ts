import { Inject, Injectable } from '@nestjs/common';

import { ITicketRepository } from 'src/domain/tickets/repositories/ticket.repository';
import { Ticket } from 'src/domain/tickets/entities/ticket.entity';
import { Message } from 'src/domain/tickets/entities/message.entity';
import { ID_GENERATOR, IIdGenerator } from 'src/domain/shared/services/id-generator.service';
import { TicketStatus } from 'src/domain/tickets/value-objects/ticket-status.vo';

import { CreateTicketInput } from '../dto/create-ticket.input';

@Injectable()
export class CreateTicketUseCase {
  constructor(
    @Inject('TICKET_REPOSITORY')
    private readonly ticketRepository: ITicketRepository,

    @Inject(ID_GENERATOR)
    private readonly idGenerator: IIdGenerator,
  ) {}

  async execute(input: CreateTicketInput): Promise<Ticket> {
    const ticketId = this.idGenerator.generate();
    const messageId = this.idGenerator.generate();

    const ticket = new Ticket(
      ticketId,
      input.userId,
      input.subject,
      TicketStatus.OPEN,
      new Date(),
      [],
    );

    const message = new Message(
      messageId,
      ticketId,
      input.gmailId,
      'customer',
      'agent',
      input.content,
      new Date(),
    );

    ticket.addMessage(message);

    await this.ticketRepository.create(ticket);

    return ticket;
  }
}
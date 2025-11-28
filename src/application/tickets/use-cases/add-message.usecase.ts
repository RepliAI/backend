import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ITicketRepository, TICKET_REPOSITORY } from 'src/domain/tickets/repositories/ticket.repository';
import { Message } from 'src/domain/tickets/entities/message.entity';
import { ID_GENERATOR, IIdGenerator } from 'src/domain/shared/services/id-generator.service';

import { AddMessageInput } from '../dto/add-message.input';

@Injectable()
export class AddMessageToTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: ITicketRepository,

    @Inject(ID_GENERATOR)
    private readonly idGenerator: IIdGenerator,
  ) {}

  async execute(input: AddMessageInput): Promise<Message> {
    const ticket = await this.ticketRepository.findById(input.ticketId, input.userId);

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${input.ticketId} not found.`);
    }

    if (ticket.userId !== input.userId) {
      throw new ForbiddenException('You do not own this ticket.');
    }

    const message = new Message(
      this.idGenerator.generate(),
      ticket.id,
      input.gmailId,
      'agent',
      'customer',
      input.content,
      new Date(),
    );

    ticket.addMessage(message);

    await this.ticketRepository.update(ticket);

    return message;
  }
}
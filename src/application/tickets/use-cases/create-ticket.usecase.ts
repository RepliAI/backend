import { Inject, Injectable } from '@nestjs/common';

import { ITicketRepository, TICKET_REPOSITORY } from 'src/domain/tickets/repositories/ticket.repository';
import { Ticket } from 'src/domain/tickets/entities/ticket.entity';
import { Message } from 'src/domain/tickets/entities/message.entity';
import { ID_GENERATOR, IIdGenerator } from 'src/domain/shared/services/id-generator.service';
import { TicketStatus } from 'src/domain/tickets/value-objects/ticket-status.vo';
import { I_AI_SERVICE, IAiService } from 'src/domain/shared/services/ai-service.interface';
import { I_EVENT_SERVICE, IEventService } from 'src/domain/shared/services/event-service.interface';

import { CreateTicketInput } from '../dto/create-ticket.input';

@Injectable()
export class CreateTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: ITicketRepository,

    @Inject(ID_GENERATOR)
    private readonly idGenerator: IIdGenerator,
    @Inject(I_AI_SERVICE)
    private readonly aiService: IAiService,
    @Inject(I_EVENT_SERVICE)
    private readonly eventService: IEventService,
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

    const isSafe = await this.aiService.isSafeForAutoReply(input.content);
    if (!isSafe) {
      await this.ticketRepository.markMessageAsRisky(messageId);
    }

    this.eventService.emitNewTicket(input.userId, {
      id: ticketId,
      subject: input.subject,
    });

    return ticket;
  }
}
import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ITicketRepository, TICKET_REPOSITORY } from 'src/domain/tickets/repositories/ticket.repository';
import { Message } from 'src/domain/tickets/entities/message.entity';
import { ID_GENERATOR, IIdGenerator } from 'src/domain/shared/services/id-generator.service';
import { IGMAIL_SERVICE, IGmailService } from 'src/domain/gmail/service/gmail.service';
import { I_AI_SERVICE, IAiService } from 'src/domain/shared/services/ai-service.interface';
import { I_EVENT_SERVICE, IEventService } from 'src/domain/shared/services/event-service.interface';

import { AddMessageInput } from '../dto/add-message.input';

@Injectable()
export class AddMessageToTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: ITicketRepository,

    @Inject(ID_GENERATOR)
    private readonly idGenerator: IIdGenerator,

    @Inject(IGMAIL_SERVICE)
    private readonly gmailService: IGmailService,
    @Inject(I_AI_SERVICE)
    private readonly aiService: IAiService,
    @Inject(I_EVENT_SERVICE)
    private readonly eventService: IEventService,
  ) {}

  async execute(input: AddMessageInput): Promise<Message> {
    const ticket = await this.ticketRepository.findById(input.ticketId, input.userId);

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${input.ticketId} not found.`);
    }

    if (ticket.userId !== input.userId) {
      throw new ForbiddenException('You do not own this ticket.');
    }

    const lastMessage = ticket.messages.at(-1);

    if (!lastMessage) {
      throw new ForbiddenException('Cannot reply: ticket has no existing messages.');
    }
    if (!lastMessage.gmailId) {
      throw new ForbiddenException('Cannot reply: missing gmailId of the last message.');
    }

    try {
      await this.gmailService.sendReply({
        userId: input.userId,
        threadId: lastMessage.threadId,
        to: lastMessage.from,
        subject: ticket.subject,
        content: input.content,
      });
    } catch (err) {
      throw new ForbiddenException(
        'GMAIL_NOT_CONNECTED'
      );
    }

    const message = new Message(
      this.idGenerator.generate(),
      ticket.id,
      input.gmailId,
      input.isAutoReply ? 'ai' : 'agent',
      'customer',
      input.content,
      new Date(),
    );

    await this.ticketRepository.addMessage(ticket.id, message);
    
    if (lastMessage.from !== 'agent' && lastMessage.from !== 'ai' && !lastMessage.isRisky) {
      const isSafe = await this.aiService.isSafeForAutoReply(lastMessage.content);
      if (!isSafe) {
        await this.ticketRepository.markMessageAsRisky(lastMessage.id);
      }
    }

    if (!input.isAutoReply) {
      this.eventService.emitNewMessage(input.userId, {
        ticketId: ticket.id,
        ticketSubject: ticket.subject,
        content: message.content,
      });
    }
    
    ticket.markPending();
    await this.ticketRepository.updateStatus(ticket.id, ticket.status);

    return message;
  }
}
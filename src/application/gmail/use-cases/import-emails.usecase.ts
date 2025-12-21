import { Inject, Injectable } from '@nestjs/common';

import { ITicketRepository, TICKET_REPOSITORY } from 'src/domain/tickets/repositories/ticket.repository';
import { Message } from 'src/domain/tickets/entities/message.entity';
import { Ticket } from 'src/domain/tickets/entities/ticket.entity';
import { TicketStatus } from 'src/domain/tickets/value-objects/ticket-status.vo';
import { IGMAIL_SERVICE, IGmailService } from 'src/domain/gmail/service/gmail.service';
import { IIdGenerator, ID_GENERATOR } from 'src/domain/shared/services/id-generator.service';
import { AutoReplyToTicketUseCase } from 'src/application/tickets/use-cases/auto-reply-to-ticket.usecase';
import { I_AI_SERVICE, IAiService } from 'src/domain/shared/services/ai-service.interface';
import { I_EVENT_SERVICE, IEventService } from 'src/domain/shared/services/event-service.interface';

import { ImportEmailsInput, ImportEmailsOutput } from '../dto/import-email.dto';

@Injectable()
export class ImportEmailsUseCase {
  constructor(
    @Inject(IGMAIL_SERVICE)
    private readonly gmailService: IGmailService,
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: ITicketRepository,
    @Inject(ID_GENERATOR)
    private readonly idGenerator: IIdGenerator,
    private readonly autoReplyToTicket: AutoReplyToTicketUseCase,
    @Inject(I_EVENT_SERVICE)
    private readonly eventService: IEventService,
    @Inject(I_AI_SERVICE)
    private readonly aiService: IAiService,
  ) { }

  async execute(input: ImportEmailsInput): Promise<ImportEmailsOutput> {
    const emails = await this.gmailService.fetchRecentMessages(input.userId);

    let count = 0;

    for (const mail of emails) {
      const exists = await this.ticketRepository.findMessageByGmailId(mail.id);
      if (exists) continue;

      let ticket = await this.ticketRepository.findByThreadId(mail.threadId);
      const isNewTicket = !ticket;

      if (!ticket) {
        ticket = new Ticket(
          this.idGenerator.generate(),
          input.userId,
          mail.subject,
          TicketStatus.OPEN,
          new Date(),
          [],
        );

        await this.ticketRepository.create(ticket);
        this.eventService.emitNewTicket(input.userId, {
          id: ticket.id,
          subject: ticket.subject,
        });
      }

      const message = new Message(
        this.idGenerator.generate(),
        ticket.id,
        mail.id,
        mail.from,
        mail.to,
        mail.content,
        mail.date,
        mail.threadId,
      );
      await this.ticketRepository.addMessage(ticket.id, message);

      if (mail.from !== 'agent') {
        const isSafe = await this.aiService.isSafeForAutoReply(mail.content);
        if (!isSafe) {
          await this.ticketRepository.markMessageAsRisky(message.id);
        }

        if (!isNewTicket) {
          this.eventService.emitNewMessage(input.userId, {
            ticketId: ticket.id,
            ticketSubject: ticket.subject,
            content: message.content,
          });
        }

        this.autoReplyToTicket.execute(ticket.id, input.userId).catch(err => {
          console.error(`Auto-reply failed for ticket ${ticket.id}:`, err);
        });
      }
      count++;
    }

    const output = new ImportEmailsOutput();
    output.imported = count;
    return output;
  }
}
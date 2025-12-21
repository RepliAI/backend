import { Inject, Injectable } from '@nestjs/common';

import { ITicketRepository, TICKET_REPOSITORY } from 'src/domain/tickets/repositories/ticket.repository';
import { Message } from 'src/domain/tickets/entities/message.entity';
import { Ticket } from 'src/domain/tickets/entities/ticket.entity';
import { TicketStatus } from 'src/domain/tickets/value-objects/ticket-status.vo';
import { IGMAIL_SERVICE, IGmailService } from 'src/domain/gmail/service/gmail.service';
import { IIdGenerator, ID_GENERATOR } from 'src/domain/shared/services/id-generator.service';
import { AutoReplyToTicketUseCase } from 'src/application/tickets/use-cases/auto-reply-to-ticket.usecase';

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
  ) { }

  async execute(input: ImportEmailsInput): Promise<ImportEmailsOutput> {
    const emails = await this.gmailService.fetchRecentMessages(input.userId);

    let count = 0;

    for (const mail of emails) {
      const exists = await this.ticketRepository.findMessageByGmailId(mail.id);
      if (exists) continue;

      let ticket = await this.ticketRepository.findByThreadId(mail.threadId);

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

      count++;
      if (mail.from !== 'agent') {
        this.autoReplyToTicket.execute(ticket.id, input.userId).catch(err => {
          console.error(`Auto-reply failed for ticket ${ticket.id}:`, err);
        });
      }
    }

    const output = new ImportEmailsOutput();
    output.imported = count;
    return output;
  }
}
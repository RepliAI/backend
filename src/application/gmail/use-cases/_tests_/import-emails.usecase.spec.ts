import { IGmailService } from 'src/domain/gmail/service/gmail.service';
import { Ticket } from 'src/domain/tickets/entities/ticket.entity';
import { Message } from 'src/domain/tickets/entities/message.entity';
import { createMockGmailEmail } from 'src/tests/mocks/gmail-message.mock';
import { createTicketRepoMock } from 'src/tests/mocks/ticket-repo.mock';
import { createIdGeneratorMock } from 'src/tests/mocks/id-generalor.mock';

import { ImportEmailsUseCase } from '../import-emails.usecase';
import { ImportEmailsInput } from '../../dto/import-email.dto';

describe('ImportEmailsUseCase', () => {
  it('creates a ticket and message when Gmail message is new', async () => {
    const gmailService: jest.Mocked<IGmailService> = {
      fetchRecentMessages: jest.fn().mockResolvedValue([
        createMockGmailEmail({
          id: 'gmail-1',
          subject: 'Problème commande',
          content: 'Bonjour, j’ai un problème...',
        }),
      ]),
    } as any;

    const ticketRepo = createTicketRepoMock();
    ticketRepo.findMessageByGmailId.mockResolvedValue(null);
    ticketRepo.findBySubjectAndUser.mockResolvedValue(null);

    const idGenerator = createIdGeneratorMock();
    idGenerator.generate
      .mockReturnValueOnce('ticket-id-1')
      .mockReturnValueOnce('message-id-1');

    const useCase = new ImportEmailsUseCase(
      gmailService,
      ticketRepo,
      idGenerator,
    );

    const result = await useCase.execute(new ImportEmailsInput('user-123'));

    expect(result.imported).toBe(1);
    expect(gmailService.fetchRecentMessages).toHaveBeenCalledWith('user-123');
    expect(ticketRepo.findMessageByGmailId).toHaveBeenCalledWith('gmail-1');
    expect(ticketRepo.findBySubjectAndUser).toHaveBeenCalledWith(
      'Problème commande',
      'user-123',
    );
    expect(ticketRepo.create).toHaveBeenCalledTimes(1);
    expect(ticketRepo.addMessage).toHaveBeenCalledTimes(1);
    expect(idGenerator.generate).toHaveBeenCalledTimes(2);
  });

  it('skips import when Gmail message already exists', async () => {
    const gmailService: jest.Mocked<IGmailService> = {
      fetchRecentMessages: jest.fn().mockResolvedValue([
        createMockGmailEmail({
          id: 'gmail-1',
          subject: 'Problème commande',
          content: 'Bonjour',
        }),
      ]),
    } as any;

    const existingTicket = new Ticket(
      'ticket-1',
      'user-123',
      'Problème commande',
      'open',
      new Date(),
      [
        new Message(
          'm1',
          'ticket-1',
          'gmail-1',
          'client@example.com',
          'support@replyia.com',
          'Bonjour',
          new Date(),
        ),
      ],
    );

    const ticketRepo = createTicketRepoMock();
    ticketRepo.findMessageByGmailId.mockResolvedValue(
      existingTicket.messages[0],
    );

    const idGenerator = createIdGeneratorMock();

    const useCase = new ImportEmailsUseCase(
      gmailService,
      ticketRepo,
      idGenerator,
    );

    const result = await useCase.execute(new ImportEmailsInput('user-123'));

    expect(result.imported).toBe(0);
    expect(ticketRepo.create).not.toHaveBeenCalled();
    expect(ticketRepo.addMessage).not.toHaveBeenCalled();
    expect(idGenerator.generate).not.toHaveBeenCalled();
  });
});

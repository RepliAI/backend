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
    const mockEmail = createMockGmailEmail({
      id: 'gmail-1',
      subject: 'Problème commande',
      content: "Bonjour, j'ai un problème...",
      threadId: 'thread-1',
    });

    const gmailService: jest.Mocked<IGmailService> = {
      fetchRecentMessages: jest.fn().mockResolvedValue([mockEmail]),
    } as any;

    const ticketRepo = createTicketRepoMock();
    ticketRepo.findMessageByGmailId.mockResolvedValue(null);
    ticketRepo.findByThreadId.mockResolvedValue(null);

    const idGenerator = createIdGeneratorMock();
    idGenerator.generate
      .mockReturnValueOnce('ticket-id-1')
      .mockReturnValueOnce('message-id-1');

    const useCase = new ImportEmailsUseCase(
      gmailService,
      ticketRepo,
      idGenerator,
    );

    const input = new ImportEmailsInput();
    input.userId = 'user-123';
    const result = await useCase.execute(input);

    expect(result.imported).toBe(1);
    expect(gmailService.fetchRecentMessages).toHaveBeenCalledWith('user-123');
    expect(ticketRepo.findMessageByGmailId).toHaveBeenCalledWith('gmail-1');
    expect(ticketRepo.findByThreadId).toHaveBeenCalledWith('thread-1');
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
          threadId: 'thread-1',
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
          'thread-1',
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

    const input = new ImportEmailsInput();
    input.userId = 'user-123';
    const result = await useCase.execute(input);

    expect(result.imported).toBe(0);
    expect(ticketRepo.create).not.toHaveBeenCalled();
    expect(ticketRepo.addMessage).not.toHaveBeenCalled();
    expect(idGenerator.generate).not.toHaveBeenCalled();
  });

  it('adds message to existing ticket when threadId matches', async () => {
    const mockEmail = createMockGmailEmail({
      id: 'gmail-2',
      subject: 'Problème commande',
      content: 'Nouveau message',
      threadId: 'thread-1',
    });

    const gmailService: jest.Mocked<IGmailService> = {
      fetchRecentMessages: jest.fn().mockResolvedValue([mockEmail]),
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
          'Premier message',
          new Date(),
          'thread-1',
        ),
      ],
    );

    const ticketRepo = createTicketRepoMock();
    ticketRepo.findMessageByGmailId.mockResolvedValue(null);
    ticketRepo.findByThreadId.mockResolvedValue(existingTicket);

    const idGenerator = createIdGeneratorMock();
    idGenerator.generate.mockReturnValue('message-id-2');

    const useCase = new ImportEmailsUseCase(
      gmailService,
      ticketRepo,
      idGenerator,
    );

    const input = new ImportEmailsInput();
    input.userId = 'user-123';
    const result = await useCase.execute(input);

    expect(result.imported).toBe(1);
    expect(ticketRepo.findByThreadId).toHaveBeenCalledWith('thread-1');
    expect(ticketRepo.create).not.toHaveBeenCalled();
    expect(ticketRepo.addMessage).toHaveBeenCalledTimes(1);
    expect(idGenerator.generate).toHaveBeenCalledTimes(1);
  });
});
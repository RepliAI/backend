import { createTicketRepoMock } from 'src/tests/mocks/ticket-repo.mock';
import { createIdGeneratorMock } from 'src/tests/mocks/id-generalor.mock';
import { Ticket } from 'src/domain/tickets/entities/ticket.entity';
import { Message } from 'src/domain/tickets/entities/message.entity';
import { createGmailServiceMock } from 'src/tests/mocks/gmail-service.mock';

import { AddMessageInput } from '../../dto/add-message.input';
import { AddMessageToTicketUseCase } from '../add-message.usecase';

describe('AddMessageToTicketUseCase', () => {
  let useCase: AddMessageToTicketUseCase;
  let ticketRepository: ReturnType<typeof createTicketRepoMock>;
  let idGenerator: ReturnType<typeof createIdGeneratorMock>;
  let gmailServiceMock: ReturnType<typeof createGmailServiceMock>;

  beforeEach(() => {
    ticketRepository = createTicketRepoMock();
    idGenerator = createIdGeneratorMock();
    gmailServiceMock = createGmailServiceMock()

    useCase = new AddMessageToTicketUseCase(ticketRepository, idGenerator, gmailServiceMock);
  });

  it('should throw if ticket does not exist', async () => {
    ticketRepository.findById.mockResolvedValue(null);

    const input = new AddMessageInput();
    input.ticketId = 't1';
    input.userId = 'user1';
    input.content = 'Hello';

    await expect(useCase.execute(input)).rejects.toThrow(
      'Ticket with ID t1 not found.',
    );
  });

  it('should throw if ticket does not belong to the user', async () => {
    const ticket = new Ticket('t1', 'otherUser', 'subject', 'open', new Date(), []);
    ticketRepository.findById.mockResolvedValue(ticket);

    const input = new AddMessageInput();
    input.ticketId = 't1';
    input.userId = 'user1';
    input.content = 'Test message';

    await expect(useCase.execute(input)).rejects.toThrow(
      'You do not own this ticket.',
    );
  });

  it('should append a new message to the ticket', async () => {
    const existingMessage = new Message(
      'msg1',
      't1',
      'gmail-1',
      'customer',
      'agent',
      'Initial message',
      new Date(),
      'thread-1',
    );

    const ticket = new Ticket(
      't1',
      'user1',
      'subject',
      'open',
      new Date(),
      [existingMessage],
    );

    ticketRepository.findById.mockResolvedValue(ticket);
    idGenerator.generate.mockReturnValue('msg123');
    gmailServiceMock.sendReply.mockResolvedValue(undefined);

    const input = new AddMessageInput();
    input.ticketId = 't1';
    input.userId = 'user1';
    input.content = 'Hello world';
    input.gmailId = 'gmail-2';

    const result = await useCase.execute(input);

    expect(ticketRepository.addMessage).toHaveBeenCalledTimes(1);
    expect(gmailServiceMock.sendReply).toHaveBeenCalledWith({
      userId: 'user1',
      threadId: 'thread-1',
      to: 'customer',
      subject: 'subject',
      content: 'Hello world',
    });

    expect(result).toBeInstanceOf(Message);
    expect(result.id).toBe('msg123');
    expect(result.content).toBe('Hello world');
    expect(result.ticketId).toBe('t1');
  });

  it('should call repository.update with updated ticket', async () => {
    const existingMessage = new Message(
      'msg1',
      't1',
      'gmail-1',
      'customer',
      'agent',
      'Initial message',
      new Date(),
      'thread-1',
    );

    const ticket = new Ticket(
      't1',
      'user1',
      'subject',
      'open',
      new Date(),
      [existingMessage],
    );

    ticketRepository.findById.mockResolvedValue(ticket);
    idGenerator.generate.mockReturnValue('m1');
    gmailServiceMock.sendReply.mockResolvedValue(undefined);

    const input = new AddMessageInput();
    input.ticketId = 't1';
    input.userId = 'user1';
    input.content = 'hello';
    input.gmailId = 'gmail-2';

    await useCase.execute(input);

    expect(ticketRepository.addMessage).toHaveBeenCalledTimes(1);
  });
});
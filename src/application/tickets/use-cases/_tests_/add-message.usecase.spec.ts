import { createTicketRepoMock } from 'src/tests/mocks/ticket-repo.mock';
import { createIdGeneratorMock } from 'src/tests/mocks/id-generalor.mock';
import { createAiServiceMock } from 'src/tests/mocks/ai-service.mock';
import { createEventServiceMock } from 'src/tests/mocks/event-service.mock';
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
  let aiService: ReturnType<typeof createAiServiceMock>;
  let eventService: ReturnType<typeof createEventServiceMock>;

  beforeEach(() => {
    ticketRepository = createTicketRepoMock();
    idGenerator = createIdGeneratorMock();
    gmailServiceMock = createGmailServiceMock();
    aiService = createAiServiceMock();
    eventService = createEventServiceMock();

    useCase = new AddMessageToTicketUseCase(
      ticketRepository,
      idGenerator,
      gmailServiceMock,
      aiService,
      eventService,
    );
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

  it('should append a new message to the ticket with from="agent" by default', async () => {
    const existingMessage = new Message(
      'msg1',
      't1',
      'gmail-1',
      'customer',
      'agent',
      'Initial message',
      new Date(),
      'thread-1',
      false,
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
    aiService.isSafeForAutoReply.mockResolvedValue(true);

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
    expect(result.from).toBe('agent');
    expect(eventService.emitNewMessage).toHaveBeenCalledWith('user1', {
      ticketId: 't1',
      ticketSubject: 'subject',
      content: 'Hello world',
    });
  });

  it('should append a message with from="ai" when isAutoReply is true', async () => {
    const existingMessage = new Message(
      'msg1',
      't1',
      'gmail-1',
      'customer@example.com',
      'agent',
      'Initial message',
      new Date(),
      'thread-1',
      false,
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
    idGenerator.generate.mockReturnValue('msg456');
    gmailServiceMock.sendReply.mockResolvedValue(undefined);
    aiService.isSafeForAutoReply.mockResolvedValue(true);

    const input = new AddMessageInput();
    input.ticketId = 't1';
    input.userId = 'user1';
    input.content = 'AI generated reply';
    input.gmailId = 'gmail-3';
    input.isAutoReply = true;

    const result = await useCase.execute(input);

    expect(result.from).toBe('ai');
    expect(result.content).toBe('AI generated reply');
    expect(ticketRepository.addMessage).toHaveBeenCalledTimes(1);
    const addedMessage = (ticketRepository.addMessage as jest.Mock).mock.calls[0][1];
    expect(addedMessage.from).toBe('ai');
    // Should not emit event for auto-reply messages
    expect(eventService.emitNewMessage).not.toHaveBeenCalled();
  });

  it('should mark last message as risky when content is not safe', async () => {
    const lastMessage = new Message(
      'msg1',
      't1',
      'gmail-1',
      'customer@example.com',
      'agent',
      'I am very angry!',
      new Date(),
      'thread-1',
      false, // isRisky
    );

    const ticket = new Ticket(
      't1',
      'user1',
      'subject',
      'open',
      new Date(),
      [lastMessage],
    );

    ticketRepository.findById.mockResolvedValue(ticket);
    idGenerator.generate.mockReturnValue('msg2');
    gmailServiceMock.sendReply.mockResolvedValue(undefined);
    aiService.isSafeForAutoReply.mockResolvedValue(false);

    const input = new AddMessageInput();
    input.ticketId = 't1';
    input.userId = 'user1';
    input.content = 'Reply message';
    input.gmailId = 'gmail-2';

    await useCase.execute(input);

    expect(aiService.isSafeForAutoReply).toHaveBeenCalledWith('I am very angry!');
    expect(ticketRepository.markMessageAsRisky).toHaveBeenCalledWith('msg1');
  });

  it('should not check safety for messages from agent or ai', async () => {
    const lastMessage = new Message(
      'msg1',
      't1',
      'gmail-1',
      'agent',
      'customer',
      'Agent reply',
      new Date(),
      'thread-1',
      false,
    );

    const ticket = new Ticket(
      't1',
      'user1',
      'subject',
      'open',
      new Date(),
      [lastMessage],
    );

    ticketRepository.findById.mockResolvedValue(ticket);
    idGenerator.generate.mockReturnValue('msg2');
    gmailServiceMock.sendReply.mockResolvedValue(undefined);

    const input = new AddMessageInput();
    input.ticketId = 't1';
    input.userId = 'user1';
    input.content = 'Another reply';
    input.gmailId = 'gmail-2';

    await useCase.execute(input);

    expect(aiService.isSafeForAutoReply).not.toHaveBeenCalled();
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
      false,
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
    aiService.isSafeForAutoReply.mockResolvedValue(true);

    const input = new AddMessageInput();
    input.ticketId = 't1';
    input.userId = 'user1';
    input.content = 'hello';
    input.gmailId = 'gmail-2';

    await useCase.execute(input);

    expect(ticketRepository.addMessage).toHaveBeenCalledTimes(1);
  });
});
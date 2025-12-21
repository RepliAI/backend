import { ForbiddenException } from '@nestjs/common';

import { createTicketRepoMock } from 'src/tests/mocks/ticket-repo.mock';
import { createIdGeneratorMock } from 'src/tests/mocks/id-generalor.mock';
import { createOpenAiServiceMock } from 'src/tests/mocks/openai-service.mock';
import { Ticket } from 'src/domain/tickets/entities/ticket.entity';
import { Message } from 'src/domain/tickets/entities/message.entity';

import { AutoReplyToTicketUseCase } from '../auto-reply-to-ticket.usecase';
import { CheckPlanFeatureUseCase } from 'src/application/plans/use-cases/check-plan-feature.usecase';
import { GetUserPreferencesUseCase } from 'src/application/user-preferences/use-cases/get-user-preferences.usecase';
import { GenerateAiReplyUseCase } from '../generate-ai-reply.usecase';
import { AddMessageToTicketUseCase } from '../add-message.usecase';

const createCheckPlanFeatureUseCaseMock = () => ({
  checkAutoImport: jest.fn(),
  checkAutoSend: jest.fn(),
});

const createGetUserPreferencesUseCaseMock = () => ({
  execute: jest.fn(),
});

const createGenerateAiReplyUseCaseMock = () => ({
  execute: jest.fn(),
});

const createAddMessageToTicketUseCaseMock = () => ({
  execute: jest.fn(),
});

describe('AutoReplyToTicketUseCase', () => {
  let useCase: AutoReplyToTicketUseCase;
  let ticketRepository: ReturnType<typeof createTicketRepoMock>;
  let checkPlanFeature: ReturnType<typeof createCheckPlanFeatureUseCaseMock>;
  let getUserPreferences: ReturnType<typeof createGetUserPreferencesUseCaseMock>;
  let generateAiReply: ReturnType<typeof createGenerateAiReplyUseCaseMock>;
  let addMessage: ReturnType<typeof createAddMessageToTicketUseCaseMock>;
  let openAiService: ReturnType<typeof createOpenAiServiceMock>;
  let idGenerator: ReturnType<typeof createIdGeneratorMock>;

  beforeEach(() => {
    ticketRepository = createTicketRepoMock();
    checkPlanFeature = createCheckPlanFeatureUseCaseMock();
    getUserPreferences = createGetUserPreferencesUseCaseMock();
    generateAiReply = createGenerateAiReplyUseCaseMock();
    addMessage = createAddMessageToTicketUseCaseMock();
    openAiService = createOpenAiServiceMock();
    idGenerator = createIdGeneratorMock();

    useCase = new AutoReplyToTicketUseCase(
      ticketRepository,
      checkPlanFeature as any,
      getUserPreferences as any,
      generateAiReply as any,
      addMessage as any,
      openAiService,
      idGenerator,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should skip auto-reply when autoAiSend is disabled', async () => {
    getUserPreferences.execute.mockResolvedValue({
      tone: 'neutral',
      signature: '',
      autoImport: false,
      autoAiSend: false,
    });

    await useCase.execute('ticket1', 'user1');

    expect(getUserPreferences.execute).toHaveBeenCalledWith('user1');
    expect(checkPlanFeature.checkAutoSend).not.toHaveBeenCalled();
    expect(ticketRepository.findById).not.toHaveBeenCalled();
  });

  it('should skip auto-reply when plan does not allow autoSend', async () => {
    getUserPreferences.execute.mockResolvedValue({
      tone: 'neutral',
      signature: '',
      autoImport: false,
      autoAiSend: true,
    });
    checkPlanFeature.checkAutoSend.mockRejectedValue(
      new ForbiddenException('Plan does not allow autoSend')
    );

    await useCase.execute('ticket1', 'user1');

    expect(checkPlanFeature.checkAutoSend).toHaveBeenCalledWith('user1');
    expect(ticketRepository.findById).not.toHaveBeenCalled();
  });

  it('should skip auto-reply when ticket does not exist', async () => {
    getUserPreferences.execute.mockResolvedValue({
      tone: 'neutral',
      signature: '',
      autoImport: false,
      autoAiSend: true,
    });
    checkPlanFeature.checkAutoSend.mockResolvedValue(undefined);
    ticketRepository.findById.mockResolvedValue(null);

    await useCase.execute('ticket1', 'user1');

    expect(ticketRepository.findById).toHaveBeenCalledWith('ticket1', 'user1');
    expect(generateAiReply.execute).not.toHaveBeenCalled();
  });

  it('should skip auto-reply when ticket has no messages', async () => {
    getUserPreferences.execute.mockResolvedValue({
      tone: 'neutral',
      signature: '',
      autoImport: false,
      autoAiSend: true,
    });
    checkPlanFeature.checkAutoSend.mockResolvedValue(undefined);
    const ticket = new Ticket('t1', 'user1', 'subject', 'open', new Date(), []);
    ticketRepository.findById.mockResolvedValue(ticket);

    await useCase.execute('ticket1', 'user1');

    expect(generateAiReply.execute).not.toHaveBeenCalled();
  });

  it('should skip auto-reply when last message is from agent', async () => {
    getUserPreferences.execute.mockResolvedValue({
      tone: 'neutral',
      signature: '',
      autoImport: false,
      autoAiSend: true,
    });
    checkPlanFeature.checkAutoSend.mockResolvedValue(undefined);
    const lastMessage = new Message(
      'msg1',
      't1',
      'gmail-1',
      'agent',
      'customer',
      'Previous reply',
      new Date(),
      'thread-1',
    );
    const ticket = new Ticket('t1', 'user1', 'subject', 'open', new Date(), [lastMessage]);
    ticketRepository.findById.mockResolvedValue(ticket);

    await useCase.execute('ticket1', 'user1');

    expect(generateAiReply.execute).not.toHaveBeenCalled();
  });

  it('should skip auto-reply when last message is from ai', async () => {
    getUserPreferences.execute.mockResolvedValue({
      tone: 'neutral',
      signature: '',
      autoImport: false,
      autoAiSend: true,
    });
    checkPlanFeature.checkAutoSend.mockResolvedValue(undefined);
    const lastMessage = new Message(
      'msg1',
      't1',
      'gmail-1',
      'ai',
      'customer',
      'Previous AI reply',
      new Date(),
      'thread-1',
    );
    const ticket = new Ticket('t1', 'user1', 'subject', 'open', new Date(), [lastMessage]);
    ticketRepository.findById.mockResolvedValue(ticket);

    await useCase.execute('ticket1', 'user1');

    expect(generateAiReply.execute).not.toHaveBeenCalled();
  });

  it('should skip auto-reply when last message missing gmailId', async () => {
    getUserPreferences.execute.mockResolvedValue({
      tone: 'neutral',
      signature: '',
      autoImport: false,
      autoAiSend: true,
    });
    checkPlanFeature.checkAutoSend.mockResolvedValue(undefined);
    const lastMessage = new Message(
      'msg1',
      't1',
      null,
      'customer@example.com',
      'support@example.com',
      'Customer message',
      new Date(),
      'thread-1',
    );
    const ticket = new Ticket('t1', 'user1', 'subject', 'open', new Date(), [lastMessage]);
    ticketRepository.findById.mockResolvedValue(ticket);

    await useCase.execute('ticket1', 'user1');

    expect(generateAiReply.execute).not.toHaveBeenCalled();
  });

  it('should skip auto-reply and mark message as risky when message is not safe for auto-reply', async () => {
    getUserPreferences.execute.mockResolvedValue({
      tone: 'neutral',
      signature: '',
      autoImport: false,
      autoAiSend: true,
    });
    checkPlanFeature.checkAutoSend.mockResolvedValue(undefined);
    const lastMessage = new Message(
      'msg1',
      't1',
      'gmail-1',
      'customer@example.com',
      'support@example.com',
      'I am very angry and will sue you!',
      new Date(),
      'thread-1',
    );
    const ticket = new Ticket('t1', 'user1', 'subject', 'open', new Date(), [lastMessage]);
    ticketRepository.findById.mockResolvedValue(ticket);
    openAiService.isSafeForAutoReply.mockResolvedValue(false);
    ticketRepository.markMessageAsRisky.mockResolvedValue(undefined);

    await useCase.execute('ticket1', 'user1');

    expect(openAiService.isSafeForAutoReply).toHaveBeenCalledWith('I am very angry and will sue you!');
    expect(generateAiReply.execute).not.toHaveBeenCalled();
    expect(ticketRepository.markMessageAsRisky).toHaveBeenCalledWith('msg1');
  });

  it('should generate and send auto-reply when all conditions are met', async () => {
    getUserPreferences.execute.mockResolvedValue({
      tone: 'neutral',
      signature: '',
      autoImport: false,
      autoAiSend: true,
    });
    checkPlanFeature.checkAutoSend.mockResolvedValue(undefined);
    const lastMessage = new Message(
      'msg1',
      't1',
      'gmail-1',
      'customer@example.com',
      'support@example.com',
      'Hello, I have a question',
      new Date(),
      'thread-1',
    );
    const ticket = new Ticket('t1', 'user1', 'subject', 'open', new Date(), [lastMessage]);
    ticketRepository.findById.mockResolvedValue(ticket);
    openAiService.isSafeForAutoReply.mockResolvedValue(true);
    generateAiReply.execute.mockResolvedValue('AI generated reply');
    idGenerator.generate.mockReturnValue('gmail-msg-id');

    await useCase.execute('ticket1', 'user1');

    expect(openAiService.isSafeForAutoReply).toHaveBeenCalledWith('Hello, I have a question');
    expect(generateAiReply.execute).toHaveBeenCalledWith('ticket1', 'user1');
    expect(idGenerator.generate).toHaveBeenCalled();
    expect(addMessage.execute).toHaveBeenCalledWith({
      ticketId: 'ticket1',
      userId: 'user1',
      content: 'AI generated reply',
      gmailId: 'gmail-msg-id',
      isAutoReply: true,
    });
  });

  it('should handle errors gracefully and log them', async () => {
    getUserPreferences.execute.mockResolvedValue({
      tone: 'neutral',
      signature: '',
      autoImport: false,
      autoAiSend: true,
    });
    checkPlanFeature.checkAutoSend.mockResolvedValue(undefined);
    const lastMessage = new Message(
      'msg1',
      't1',
      'gmail-1',
      'customer@example.com',
      'support@example.com',
      'Customer message',
      new Date(),
      'thread-1',
    );
    const ticket = new Ticket('t1', 'user1', 'subject', 'open', new Date(), [lastMessage]);
    ticketRepository.findById.mockResolvedValue(ticket);
    openAiService.isSafeForAutoReply.mockResolvedValue(true);
    generateAiReply.execute.mockRejectedValue(new Error('AI service error'));

    await useCase.execute('ticket1', 'user1');

    expect(addMessage.execute).not.toHaveBeenCalled();
  });

  it('should use ai as from field when isAutoReply is true', async () => {
    getUserPreferences.execute.mockResolvedValue({
      tone: 'neutral',
      signature: '',
      autoImport: false,
      autoAiSend: true,
    });
    checkPlanFeature.checkAutoSend.mockResolvedValue(undefined);
    const lastMessage = new Message(
      'msg1',
      't1',
      'gmail-1',
      'customer@example.com',
      'support@example.com',
      'Safe customer message',
      new Date(),
      'thread-1',
    );
    const ticket = new Ticket('t1', 'user1', 'subject', 'open', new Date(), [lastMessage]);
    ticketRepository.findById.mockResolvedValue(ticket);
    openAiService.isSafeForAutoReply.mockResolvedValue(true);
    generateAiReply.execute.mockResolvedValue('AI reply');
    idGenerator.generate.mockReturnValue('gmail-id');
    const addedMessage = new Message(
      'msg2',
      't1',
      'gmail-id',
      'ai',
      'customer',
      'AI reply',
      new Date(),
    );
    addMessage.execute.mockResolvedValue(addedMessage);

    await useCase.execute('ticket1', 'user1');

    expect(addMessage.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        isAutoReply: true,
      })
    );
  });
});

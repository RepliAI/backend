import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { createTicketRepoMock } from 'src/tests/mocks/ticket-repo.mock';
import { createUserPreferencesRepoMock } from 'src/tests/mocks/user-preferences-repo.mock';
import { OpenAiService } from 'src/infrastructure/integrations/openai/openai.service';
import { Ticket } from 'src/domain/tickets/entities/ticket.entity';
import { Message } from 'src/domain/tickets/entities/message.entity';

import { GenerateAiReplyUseCase } from '../generate-ai-reply.usecase';
import { CheckAiResponseLimitUseCase } from 'src/application/plans/use-cases/check-ai-response-limit.usecase';

jest.mock('src/infrastructure/integrations/openai/openai.service');

jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    })),
  };
});

const createCheckAiResponseLimitUseCaseMock = () => ({
  execute: jest.fn(),
  incrementUsage: jest.fn(),
});

describe('GenerateAiReplyUseCase', () => {
  let useCase: GenerateAiReplyUseCase;
  let ticketRepo: ReturnType<typeof createTicketRepoMock>;
  let openAiService: jest.Mocked<OpenAiService>;
  let userPreferencesRepo: ReturnType<typeof createUserPreferencesRepoMock>;
  let checkAiResponseLimit: ReturnType<typeof createCheckAiResponseLimitUseCaseMock>;

  beforeEach(() => {
    ticketRepo = createTicketRepoMock();
    openAiService = new OpenAiService() as jest.Mocked<OpenAiService>;
    openAiService.generateReply = jest.fn();
    userPreferencesRepo = createUserPreferencesRepoMock();
    checkAiResponseLimit = createCheckAiResponseLimitUseCaseMock();

    useCase = new GenerateAiReplyUseCase(
      ticketRepo,
      openAiService,
      userPreferencesRepo,
      checkAiResponseLimit as any,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should throw if limit check fails', async () => {
    checkAiResponseLimit.execute.mockRejectedValue(
      new ForbiddenException('Limit reached')
    );

    await expect(
      useCase.execute('ticket1', 'user1'),
    ).rejects.toThrow(ForbiddenException);

    expect(checkAiResponseLimit.execute).toHaveBeenCalledWith('user1');
    expect(ticketRepo.findById).not.toHaveBeenCalled();
  });

  it('should throw if ticket does not exist', async () => {
    checkAiResponseLimit.execute.mockResolvedValue(undefined);
    ticketRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('ticket1', 'user1'),
    ).rejects.toThrow(NotFoundException);
    await expect(
      useCase.execute('ticket1', 'user1'),
    ).rejects.toThrow('Ticket with ID ticket1 not found.');

    expect(checkAiResponseLimit.execute).toHaveBeenCalledWith('user1');
  });

  it('should check limit before generating reply', async () => {
    const ticket = new Ticket(
      't1',
      'user1',
      'Test subject',
      'open',
      new Date(),
      [
        new Message(
          'msg1',
          't1',
          'g1',
          'customer',
          'agent',
          "Bonjour, j'ai un problème.",
          new Date(),
          'thread-1',
        ),
      ],
    );

    checkAiResponseLimit.execute.mockResolvedValue(undefined);
    ticketRepo.findById.mockResolvedValue(ticket);
    userPreferencesRepo.getByUserId.mockResolvedValue(null);
    openAiService.generateReply.mockResolvedValue('AI_REPLY');

    await useCase.execute('t1', 'user1');

    expect(checkAiResponseLimit.execute).toHaveBeenCalledWith('user1');
    expect(checkAiResponseLimit.execute).toHaveBeenCalledTimes(1);
    expect(openAiService.generateReply).toHaveBeenCalledTimes(1);
  });

  it('should increment usage after successful generation', async () => {
    const ticket = new Ticket(
      't1',
      'user1',
      'Test subject',
      'open',
      new Date(),
      [
        new Message(
          'msg1',
          't1',
          'g1',
          'customer',
          'agent',
          "Bonjour, j'ai un problème.",
          new Date(),
          'thread-1',
        ),
      ],
    );

    checkAiResponseLimit.execute.mockResolvedValue(undefined);
    ticketRepo.findById.mockResolvedValue(ticket);
    userPreferencesRepo.getByUserId.mockResolvedValue(null);
    openAiService.generateReply.mockResolvedValue('AI_REPLY');

    await useCase.execute('t1', 'user1');

    expect(checkAiResponseLimit.incrementUsage).toHaveBeenCalledWith('user1');
    expect(checkAiResponseLimit.incrementUsage).toHaveBeenCalledTimes(1);
    expect(openAiService.generateReply).toHaveBeenCalledTimes(1);
  });

  it('should not increment usage if generation fails', async () => {
    const ticket = new Ticket(
      't1',
      'user1',
      'Test subject',
      'open',
      new Date(),
      [
        new Message(
          'msg1',
          't1',
          'g1',
          'customer',
          'agent',
          "Bonjour, j'ai un problème.",
          new Date(),
          'thread-1',
        ),
      ],
    );

    checkAiResponseLimit.execute.mockResolvedValue(undefined);
    ticketRepo.findById.mockResolvedValue(ticket);
    userPreferencesRepo.getByUserId.mockResolvedValue(null);
    openAiService.generateReply.mockRejectedValue(new Error('OpenAI error'));

    await expect(useCase.execute('t1', 'user1')).rejects.toThrow('OpenAI error');

    expect(checkAiResponseLimit.incrementUsage).not.toHaveBeenCalled();
  });

  it('should call OpenAI with generated prompt', async () => {
    const ticket = new Ticket(
      't1',
      'user1',
      'Test subject',
      'open',
      new Date(),
      [
        new Message(
          'msg1',
          't1',
          'g1',
          'customer',
          'agent',
          "Bonjour, j'ai un problème.",
          new Date(),
          'thread-1',
        ),
      ],
    );

    checkAiResponseLimit.execute.mockResolvedValue(undefined);
    ticketRepo.findById.mockResolvedValue(ticket);
    userPreferencesRepo.getByUserId.mockResolvedValue(null);
    openAiService.generateReply.mockResolvedValue('AI_REPLY');

    await useCase.execute('t1', 'user1');

    expect(openAiService.generateReply).toHaveBeenCalledTimes(1);
    expect(userPreferencesRepo.getByUserId).toHaveBeenCalledWith('user1');

    const callArg = openAiService.generateReply.mock.calls[0][0];
    expect(callArg.user).toContain("Bonjour, j'ai un problème.");
    expect(callArg.system).toContain('assistant spécialisé en support client professionnel');
  });

  it('should throw if ticket has no messages', async () => {
    const ticket = new Ticket('t1', 'user1', 'Test subject', 'open', new Date(), []);

    checkAiResponseLimit.execute.mockResolvedValue(undefined);
    ticketRepo.findById.mockResolvedValue(ticket);

    await expect(useCase.execute('t1', 'user1')).rejects.toThrow(ForbiddenException);
    await expect(useCase.execute('t1', 'user1')).rejects.toThrow(
      'Cannot generate reply: no message found on this ticket.',
    );

    expect(checkAiResponseLimit.incrementUsage).not.toHaveBeenCalled();
  });

  it('should throw if last message has no gmailId', async () => {
    const ticket = new Ticket(
      't1',
      'user1',
      'Test subject',
      'open',
      new Date(),
      [
        new Message('msg1', 't1', null, 'customer', 'agent', 'Hello', new Date()),
      ],
    );

    checkAiResponseLimit.execute.mockResolvedValue(undefined);
    ticketRepo.findById.mockResolvedValue(ticket);

    await expect(useCase.execute('t1', 'user1')).rejects.toThrow(ForbiddenException);
    await expect(useCase.execute('t1', 'user1')).rejects.toThrow(
      'Cannot reply: last message has no Gmail ID (required for threading).',
    );

    expect(checkAiResponseLimit.incrementUsage).not.toHaveBeenCalled();
  });

  it('should return the generated reply', async () => {
    const ticket = new Ticket(
      't1',
      'user1',
      'Subject',
      'open',
      new Date(),
      [
        new Message(
          'msg1',
          't1',
          'g1',
          'customer',
          'agent',
          "Bonjour, j'ai un problème.",
          new Date(),
          'thread-1',
        ),
      ],
    );

    checkAiResponseLimit.execute.mockResolvedValue(undefined);
    ticketRepo.findById.mockResolvedValue(ticket);
    userPreferencesRepo.getByUserId.mockResolvedValue(null);
    openAiService.generateReply.mockResolvedValue('AI_REPLY');

    const result = await useCase.execute('t1', 'user1');

    expect(result).toBe('AI_REPLY');
    expect(checkAiResponseLimit.incrementUsage).toHaveBeenCalledWith('user1');
  });

  it('should use user preferences when available', async () => {
    const ticket = new Ticket(
      't1',
      'user1',
      'Subject',
      'open',
      new Date(),
      [
        new Message(
          'msg1',
          't1',
          'g1',
          'customer',
          'agent',
          'Hello',
          new Date(),
          'thread-1',
        ),
      ],
    );

    checkAiResponseLimit.execute.mockResolvedValue(undefined);
    ticketRepo.findById.mockResolvedValue(ticket);
    userPreferencesRepo.getByUserId.mockResolvedValue({
      id: 'pref1',
      userId: 'user1',
      tone: 'friendly',
      signature: 'Best regards',
      autoImport: true,
      autoAiSend: false,
    } as any);
    openAiService.generateReply.mockResolvedValue('AI_REPLY');

    await useCase.execute('t1', 'user1');

    const callArg = openAiService.generateReply.mock.calls[0][0];
    expect(callArg.user).toContain('tone: "friendly"');
    expect(callArg.user).toContain('signature: """Best regards"""');
    expect(checkAiResponseLimit.incrementUsage).toHaveBeenCalledWith('user1');
  });
});
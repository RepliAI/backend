import { createTicketRepoMock } from 'src/tests/mocks/ticket-repo.mock';
import { createUserPreferencesRepoMock } from 'src/tests/mocks/user-preferences-repo.mock';
import { OpenAiService } from 'src/infrastructure/integrations/openai/openai.service';
import { Ticket } from 'src/domain/tickets/entities/ticket.entity';
import { Message } from 'src/domain/tickets/entities/message.entity';

import { GenerateAiReplyUseCase } from '../generate-ai-reply.usecase';

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

describe('GenerateAiReplyUseCase', () => {
  let useCase: GenerateAiReplyUseCase;
  let ticketRepo: ReturnType<typeof createTicketRepoMock>;
  let openAiService: jest.Mocked<OpenAiService>;
  let userPreferencesRepo: ReturnType<typeof createUserPreferencesRepoMock>;

  beforeEach(() => {
    ticketRepo = createTicketRepoMock();
    openAiService = new OpenAiService() as jest.Mocked<OpenAiService>;
    openAiService.generateReply = jest.fn();
    userPreferencesRepo = createUserPreferencesRepoMock();

    useCase = new GenerateAiReplyUseCase(
      ticketRepo,
      openAiService,
      userPreferencesRepo,
    );
  });

  it('should throw if ticket does not exist', async () => {
    ticketRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('ticket1', 'user1'),
    ).rejects.toThrow('Ticket with ID ticket1 not found.');
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

    ticketRepo.findById.mockResolvedValue(ticket);

    await expect(useCase.execute('t1', 'user1')).rejects.toThrow(
      'Cannot generate reply: no message found on this ticket.',
    );
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

    ticketRepo.findById.mockResolvedValue(ticket);

    await expect(useCase.execute('t1', 'user1')).rejects.toThrow(
      'Cannot reply: last message has no Gmail ID (required for threading).',
    );
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

    ticketRepo.findById.mockResolvedValue(ticket);
    userPreferencesRepo.getByUserId.mockResolvedValue(null);
    openAiService.generateReply.mockResolvedValue('AI_REPLY');

    const result = await useCase.execute('t1', 'user1');

    expect(result).toBe('AI_REPLY');
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
        ),
      ],
    );

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
  });
});
import { GenerateAiReplyUseCase } from '../generate-ai-reply.usecase';
import { createTicketRepoMock } from 'src/tests/mocks/ticket-repo.mock';
import { createIdGeneratorMock } from 'src/tests/mocks/id-generalor.mock';
import { OpenAiService } from 'src/infrastructure/integrations/openai/openai.service';
import { Ticket } from 'src/domain/tickets/entities/ticket.entity';
import { Message } from 'src/domain/tickets/entities/message.entity';

jest.mock('src/infrastructure/integrations/openai/openai.service');

jest.mock("openai", () => {
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
  let idGenerator: ReturnType<typeof createIdGeneratorMock>;

  beforeEach(() => {
    ticketRepo = createTicketRepoMock();
    openAiService = new OpenAiService() as jest.Mocked<OpenAiService>;
    openAiService.generateReply = jest.fn();
    idGenerator = createIdGeneratorMock();

    openAiService.generateReply = jest.fn();

    useCase = new GenerateAiReplyUseCase(
      ticketRepo,
      openAiService,
      idGenerator,
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
              'customer',
              'support',
              'Bonjour, j’ai un problème.',
              new Date(),
            ),
          ],
    );

    ticketRepo.findById.mockResolvedValue(ticket);
    openAiService.generateReply.mockResolvedValue('AI_REPLY');
    idGenerator.generate.mockReturnValue('msg123');

    await useCase.execute('t1', 'user1');

    expect(openAiService.generateReply).toHaveBeenCalledTimes(1);

    const callArg = openAiService.generateReply.mock.calls[0][0];
    expect(callArg).toContain("Bonjour, j’ai un problème.");
    expect(callArg).toContain("assistant support professionnel");
  });

  it('should append AI reply as a new message and update ticket', async () => {
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
              'customer',
              'support',
              'Bonjour, j’ai un problème.',
              new Date(),
            ),
        ],
    );
  
    ticketRepo.findById.mockResolvedValue(ticket);
    openAiService.generateReply.mockResolvedValue('AI_REPLY');
    idGenerator.generate.mockReturnValue('msg123');
  
    await useCase.execute('t1', 'user1');
  
    expect(ticket.messages.length).toBe(2);
  
    const msg = ticket.messages[1];
  
    expect(msg).toBeInstanceOf(Message);
    expect(msg.content).toBe('AI_REPLY');
  
    expect(ticketRepo.update).toHaveBeenCalledWith(ticket);
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
              'customer',
              'support',
              'Bonjour, j’ai un problème.',
              new Date(),
            ),
        ],
    );

    ticketRepo.findById.mockResolvedValue(ticket);
    openAiService.generateReply.mockResolvedValue('AI_REPLY');
    idGenerator.generate.mockReturnValue('id123');

    const result = await useCase.execute('t1', 'user1');

    expect(result).toBe('AI_REPLY');
  });
});

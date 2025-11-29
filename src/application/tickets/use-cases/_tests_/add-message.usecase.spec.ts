import { AddMessageToTicketUseCase } from '../add-message.usecase';
import { createTicketRepoMock } from 'src/tests/mocks/ticket-repo.mock';
import { createIdGeneratorMock } from 'src/tests/mocks/id-generalor.mock';
import { AddMessageInput } from '../../dto/add-message.input';
import { Ticket } from 'src/domain/tickets/entities/ticket.entity';
import { Message } from 'src/domain/tickets/entities/message.entity';

describe('AddMessageToTicketUseCase', () => {
  let useCase: AddMessageToTicketUseCase;
  let ticketRepository: ReturnType<typeof createTicketRepoMock>;
  let idGenerator: ReturnType<typeof createIdGeneratorMock>;

  beforeEach(() => {
    ticketRepository = createTicketRepoMock();
    idGenerator = createIdGeneratorMock();

    useCase = new AddMessageToTicketUseCase(ticketRepository, idGenerator);
  });

  it('should throw if ticket does not exist', async () => {
    ticketRepository.findById.mockResolvedValue(null);

    const input = new AddMessageInput('t1', 'user1', 'Hello');

    await expect(useCase.execute(input)).rejects.toThrow(
      'Ticket with ID t1 not found.',
    );
  });

  it('should throw if ticket does not belong to the user', async () => {
    const ticket = new Ticket('t1', 'otherUser', 'subject', 'open', new Date(), []);
    ticketRepository.findById.mockResolvedValue(ticket);

    const input = new AddMessageInput('t1', 'user1', 'Test message');

    await expect(useCase.execute(input)).rejects.toThrow(
      'You do not own this ticket.',
    );
  });

  it('should append a new message to the ticket', async () => {
    const ticket = new Ticket(
      't1',
      'user1',
      'subject',
      'open',
      new Date(),
      [],
    );

    ticketRepository.findById.mockResolvedValue(ticket);
    idGenerator.generate.mockReturnValue('msg123');

    const input = new AddMessageInput('t1', 'user1', 'Hello world');

    const result = await useCase.execute(input);

    expect(ticket.messages.length).toBe(1);

    const msg = ticket.messages[0];

    expect(msg).toBeInstanceOf(Message);
    expect(msg.id).toBe('msg123');
    expect(msg.content).toBe('Hello world');

    expect(result).toBe(msg);
  });

  it('should call repository.update with updated ticket', async () => {
    const ticket = new Ticket(
      't1',
      'user1',
      'subject',
      'open',
      new Date(),
      [],
    );

    ticketRepository.findById.mockResolvedValue(ticket);
    idGenerator.generate.mockReturnValue('m1');

    const input = new AddMessageInput('t1', 'user1', 'hello');

    await useCase.execute(input);

    expect(ticketRepository.addMessage).toHaveBeenCalledTimes(1);
  });
});

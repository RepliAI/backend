import { ListTicketsUseCase } from '../list-tickets.usecase';
import { createTicketRepoMock } from '../../../../tests/mocks/ticket-repo.mock';
import { Ticket } from '../../../../domain/tickets/entities/ticket.entity';

describe('ListTicketsUseCase', () => {
  it('should return tickets for the given user', async () => {
    const repo = createTicketRepoMock();

    const ticket = new Ticket(
      't1',
      'user1',
      'Subject',
      'OPEN',
      new Date(),
      []
    );

    repo.findAllByUser.mockResolvedValue([ticket]);

    const useCase = new ListTicketsUseCase(repo);

    const result = await useCase.execute('user1');

    expect(result).toHaveLength(1);
    expect(repo.findAllByUser).toHaveBeenCalledWith('user1');
    expect(result[0].id).toBe('t1');
  });
});

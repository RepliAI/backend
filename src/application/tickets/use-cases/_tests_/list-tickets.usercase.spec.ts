import { ListTicketsUseCase } from '../list-tickets.usecase';
import { createTicketRepoMock } from '../../../../tests/mocks/ticket-repo.mock';
import { Ticket } from '../../../../domain/tickets/entities/ticket.entity';
import { TicketStatus } from '../../../../domain/tickets/value-objects/ticket-status.vo';

describe('ListTicketsUseCase', () => {
  it('should return paginated tickets from the repository with filters', async () => {
    const repo = createTicketRepoMock();

    const ticket = new Ticket(
      't1',
      'user1',
      'Subject',
      'OPEN',
      new Date(),
      []
    );

    repo.listWithFilters.mockResolvedValue({
      items: [ticket],
      total: 1,
    });

    const useCase = new ListTicketsUseCase(repo);

    const result = await useCase.execute({
      userId: 'user1',
      page: 1,
      pageSize: 10,
      status: undefined,
      search: undefined,
      isRisky: undefined,
    });

    expect(repo.listWithFilters).toHaveBeenCalledWith({
      userId: 'user1',
      page: 1,
      pageSize: 10,
      status: undefined,
      search: undefined,
      isRisky: undefined,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('t1');
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  it('should pass isRisky filter to repository', async () => {
    const repo = createTicketRepoMock();

    const ticket = new Ticket(
      't1',
      'user1',
      'Subject',
      'OPEN',
      new Date(),
      []
    );

    repo.listWithFilters.mockResolvedValue({
      items: [ticket],
      total: 1,
    });

    const useCase = new ListTicketsUseCase(repo);

    await useCase.execute({
      userId: 'user1',
      page: 1,
      pageSize: 10,
      status: undefined,
      search: undefined,
      isRisky: true,
    });

    expect(repo.listWithFilters).toHaveBeenCalledWith({
      userId: 'user1',
      page: 1,
      pageSize: 10,
      status: undefined,
      search: undefined,
      isRisky: true,
    });
  });

  it('should pass all filters including isRisky to repository', async () => {
    const repo = createTicketRepoMock();

    const ticket = new Ticket(
      't1',
      'user1',
      'Subject',
      'OPEN',
      new Date(),
      []
    );

    repo.listWithFilters.mockResolvedValue({
      items: [ticket],
      total: 1,
    });

    const useCase = new ListTicketsUseCase(repo);

    await useCase.execute({
      userId: 'user1',
      page: 1,
      pageSize: 20,
      status: TicketStatus.OPEN,
      search: 'test',
      isRisky: true,
    });

    expect(repo.listWithFilters).toHaveBeenCalledWith({
      userId: 'user1',
      page: 1,
      pageSize: 20,
      status: TicketStatus.OPEN,
      search: 'test',
      isRisky: true,
    });
  });
});
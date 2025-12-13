import { NotFoundException } from '@nestjs/common';
import { createTicketRepoMock } from 'src/tests/mocks/ticket-repo.mock';
import { Ticket } from 'src/domain/tickets/entities/ticket.entity';
import { GetTicketByIdUseCase } from '../get-ticket.usecase';

describe('GetTicketByIdUseCase', () => {
  it('should return a ticket when found', async () => {
    const repo = createTicketRepoMock();

    const ticket = new Ticket(
      't1',
      'user1',
      'Subject',
      'OPEN',
      new Date(),
      []
    );

    repo.findById.mockResolvedValue(ticket);

    const useCase = new GetTicketByIdUseCase(repo);

    const result = await useCase.execute('t1', 'user1');

    expect(result.id).toBe('t1');
    expect(repo.findById).toHaveBeenCalledWith('t1', 'user1');
  });

  it('should throw if ticket not found', async () => {
    const repo = createTicketRepoMock();
    repo.findById.mockResolvedValue(null);

    const useCase = new GetTicketByIdUseCase(repo);

    await expect(useCase.execute('t123', 'user1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
import { PrismaStatsRepository } from '../prisma-stats.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('PrismaStatsRepository', () => {
  let repo: PrismaStatsRepository;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      ticket: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
    } as any as jest.Mocked<PrismaService>;

    repo = new PrismaStatsRepository(prisma);
  });

  it('doit retourner les stats + lastTickets + period', async () => {
    const userId = 'user-1';

    // Counts
    (prisma.ticket.count as jest.Mock)
      .mockResolvedValueOnce(38) // total
      .mockResolvedValueOnce(20) // open
      .mockResolvedValueOnce(10) // pending
      .mockResolvedValueOnce(8); // resolved

    const lastTickets = [
      { id: 't1', subject: 'Sujet 1', createdAt: new Date('2025-11-20T10:00:00Z') },
      { id: 't2', subject: 'Sujet 2', createdAt: new Date('2025-11-21T10:00:00Z') },
    ];

    const periodTickets = [
      { id: 'tp1', subject: 'Period 1', createdAt: new Date('2025-11-19T10:00:00Z') },
      { id: 'tp2', subject: 'Period 2', createdAt: new Date('2025-11-20T10:00:00Z') },
    ];

    // findMany : 1er appel = lastTickets, 2e appel = periodTickets
    (prisma.ticket.findMany as jest.Mock)
      .mockResolvedValueOnce(lastTickets)
      .mockResolvedValueOnce(periodTickets);

    const result = await repo.getStats(userId, 14);

    // Vérif des compteurs
    expect(prisma.ticket.count).toHaveBeenCalledTimes(4);
    expect(result.total).toBe(38);
    expect(result.open).toBe(20);
    expect(result.pending).toBe(10);
    expect(result.resolved).toBe(8);

    // Vérif des lastTickets
    expect(prisma.ticket.findMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    );
    expect(result.lastTickets).toEqual(lastTickets);

    // Vérif des tickets de période
    expect(prisma.ticket.findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          userId,
          createdAt: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
        orderBy: { createdAt: 'asc' },
      }),
    );

    expect(result.period.tickets).toEqual(periodTickets);
    expect(result.period.from).toBeInstanceOf(Date);
    expect(result.period.to).toBeInstanceOf(Date);
  });
});
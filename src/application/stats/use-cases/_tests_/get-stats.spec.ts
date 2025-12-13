import { GetStatsUseCase } from '../get-stats.usecase';
import { IStatsRepository } from 'src/domain/stats/repositories/stats.repository';

describe('GetStatsUseCase', () => {
  let useCase: GetStatsUseCase;
  let statsRepo: jest.Mocked<IStatsRepository>;

  beforeEach(() => {
    statsRepo = {
      getStats: jest.fn(),
    };

    useCase = new GetStatsUseCase(statsRepo);
  });

  it('doit appeler le repo avec 14 jours par défaut', async () => {
    const fakeResult: any = { total: 10, open: 3, pending: 4, resolved: 3, lastTickets: [], period: { from: new Date(), to: new Date(), tickets: [] } };
    statsRepo.getStats.mockResolvedValue(fakeResult);

    const result = await useCase.execute('user-1');

    expect(statsRepo.getStats).toHaveBeenCalledWith('user-1', 14);
    expect(result).toBe(fakeResult);
  });

  it('doit passer le nombre de jours fourni au repo', async () => {
    const fakeResult: any = { total: 20, open: 5, pending: 5, resolved: 10, lastTickets: [], period: { from: new Date(), to: new Date(), tickets: [] } };
    statsRepo.getStats.mockResolvedValue(fakeResult);

    const result = await useCase.execute('user-1', 30);

    expect(statsRepo.getStats).toHaveBeenCalledWith('user-1', 30);
    expect(result).toBe(fakeResult);
  });
});
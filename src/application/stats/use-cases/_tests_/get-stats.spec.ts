import { GetStatsUseCase } from '../get-stats.usecase';
import { IStatsRepository } from 'src/domain/stats/repositories/stats.repository';

describe('GetStatsUseCase', () => {
  let useCase: GetStatsUseCase;
  let statsRepository: jest.Mocked<IStatsRepository>;

  beforeEach(() => {
    statsRepository = {
      getStats: jest.fn(),
    };

    useCase = new GetStatsUseCase(statsRepository);
  });

  it('should return stats', async () => {
    const mockResult = {
      total: 5,
      open: 2,
      pending: 1,
      resolved: 2,
      lastTickets: [],
    };

    statsRepository.getStats.mockResolvedValue(mockResult);

    const result = await useCase.execute('user123');

    expect(result).toEqual(mockResult);
    expect(statsRepository.getStats).toHaveBeenCalledWith('user123');
  });
});
import { IAiUsageTrackingRepository } from 'src/domain/plans/repositories/ai-usage-tracking.repository';

export function createAiUsageTrackingRepoMock(): jest.Mocked<IAiUsageTrackingRepository> {
  return {
    getCurrentMonthUsage: jest.fn().mockResolvedValue(0),
    incrementUsage: jest.fn().mockResolvedValue(undefined),
  };
}

import { ForbiddenException } from '@nestjs/common';

import { createPlanLimitsServiceMock } from 'src/tests/mocks/plan-limits-service.mock';
import { createBillingServiceMock } from 'src/tests/mocks/billing-service.mock';
import { createAiUsageTrackingRepoMock } from 'src/tests/mocks/ai-usage-tracking-repo.mock';

import { CheckAiResponseLimitUseCase } from '../check-ai-response-limit.usecase';

describe('CheckAiResponseLimitUseCase', () => {
  let useCase: CheckAiResponseLimitUseCase;
  let planLimitsService: ReturnType<typeof createPlanLimitsServiceMock>;
  let billingService: ReturnType<typeof createBillingServiceMock>;
  let aiUsageTracking: ReturnType<typeof createAiUsageTrackingRepoMock>;

  beforeEach(() => {
    planLimitsService = createPlanLimitsServiceMock();
    billingService = createBillingServiceMock();
    aiUsageTracking = createAiUsageTrackingRepoMock();
    useCase = new CheckAiResponseLimitUseCase(
      planLimitsService,
      aiUsageTracking,
      billingService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should allow when limit is null (unlimited)', async () => {
      billingService.getActiveSubscription.mockResolvedValue({
        plan: 'pro',
        status: 'active',
        renewAt: null,
      });
      planLimitsService.getAiResponseLimit.mockReturnValue(null);

      await expect(useCase.execute('user1')).resolves.not.toThrow();

      expect(billingService.getActiveSubscription).toHaveBeenCalledWith('user1');
      expect(planLimitsService.getAiResponseLimit).toHaveBeenCalledWith('pro');
      expect(aiUsageTracking.getCurrentMonthUsage).not.toHaveBeenCalled();
    });

    it('should allow when usage is below limit', async () => {
      billingService.getActiveSubscription.mockResolvedValue({
        plan: 'free',
        status: 'active',
        renewAt: null,
      });
      planLimitsService.getAiResponseLimit.mockReturnValue(20);
      aiUsageTracking.getCurrentMonthUsage.mockResolvedValue(10);

      await expect(useCase.execute('user1')).resolves.not.toThrow();

      expect(planLimitsService.getAiResponseLimit).toHaveBeenCalledWith('free');
      expect(aiUsageTracking.getCurrentMonthUsage).toHaveBeenCalledWith('user1');
    });

    it('should allow when usage equals limit minus one', async () => {
      billingService.getActiveSubscription.mockResolvedValue({
        plan: 'free',
        status: 'active',
        renewAt: null,
      });
      planLimitsService.getAiResponseLimit.mockReturnValue(20);
      aiUsageTracking.getCurrentMonthUsage.mockResolvedValue(19);

      await expect(useCase.execute('user1')).resolves.not.toThrow();
    });

    it('should throw ForbiddenException when usage equals limit', async () => {
      billingService.getActiveSubscription.mockResolvedValue({
        plan: 'free',
        status: 'active',
        renewAt: null,
      });
      planLimitsService.getAiResponseLimit.mockReturnValue(20);
      aiUsageTracking.getCurrentMonthUsage.mockResolvedValue(20);

      await expect(useCase.execute('user1')).rejects.toThrow(ForbiddenException);
      await expect(useCase.execute('user1')).rejects.toThrow(
        'Vous avez atteint la limite de 20 réponses IA par mois pour le plan free.'
      );
    });

    it('should throw ForbiddenException when usage exceeds limit', async () => {
      billingService.getActiveSubscription.mockResolvedValue({
        plan: 'free',
        status: 'active',
        renewAt: null,
      });
      planLimitsService.getAiResponseLimit.mockReturnValue(20);
      aiUsageTracking.getCurrentMonthUsage.mockResolvedValue(25);

      await expect(useCase.execute('user1')).rejects.toThrow(ForbiddenException);
      await expect(useCase.execute('user1')).rejects.toThrow(
        'Vous avez atteint la limite de 20 réponses IA par mois pour le plan free.'
      );
    });

    it('should default to free plan when plan is null', async () => {
      billingService.getActiveSubscription.mockResolvedValue({
        plan: null,
        status: 'active',
        renewAt: null,
      });
      planLimitsService.getAiResponseLimit.mockReturnValue(20);
      aiUsageTracking.getCurrentMonthUsage.mockResolvedValue(10);

      await expect(useCase.execute('user1')).resolves.not.toThrow();

      expect(planLimitsService.getAiResponseLimit).toHaveBeenCalledWith('free');
    });

    it('should default to free plan when plan is undefined', async () => {
      billingService.getActiveSubscription.mockResolvedValue({
        plan: undefined,
        status: 'active',
        renewAt: null,
      } as any);
      planLimitsService.getAiResponseLimit.mockReturnValue(20);
      aiUsageTracking.getCurrentMonthUsage.mockResolvedValue(10);

      await expect(useCase.execute('user1')).resolves.not.toThrow();

      expect(planLimitsService.getAiResponseLimit).toHaveBeenCalledWith('free');
    });

    it('should handle business plan with null limit (unlimited)', async () => {
      billingService.getActiveSubscription.mockResolvedValue({
        plan: 'business',
        status: 'active',
        renewAt: null,
      });
      planLimitsService.getAiResponseLimit.mockReturnValue(null);

      await expect(useCase.execute('user1')).resolves.not.toThrow();

      expect(planLimitsService.getAiResponseLimit).toHaveBeenCalledWith('business');
      expect(aiUsageTracking.getCurrentMonthUsage).not.toHaveBeenCalled();
    });
  });

  describe('incrementUsage', () => {
    it('should call incrementUsage on repository', async () => {
      await useCase.incrementUsage('user1');

      expect(aiUsageTracking.incrementUsage).toHaveBeenCalledWith('user1');
      expect(aiUsageTracking.incrementUsage).toHaveBeenCalledTimes(1);
    });
  });
});


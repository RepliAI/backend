import { ForbiddenException } from '@nestjs/common';

import { createBillingServiceMock } from 'src/tests/mocks/billing-service.mock';

import { CheckPlanFeatureUseCase } from '../check-plan-feature.usecase';
import { createPlanLimitsServiceMock } from 'src/tests/mocks/plan-limits-service.mock';

describe('CheckPlanFeatureUseCase', () => {
  let useCase: CheckPlanFeatureUseCase;
  let planLimitsService: ReturnType<typeof createPlanLimitsServiceMock>;
  let billingService: ReturnType<typeof createBillingServiceMock>;

  beforeEach(() => {
    planLimitsService = createPlanLimitsServiceMock();
    billingService = createBillingServiceMock();
    useCase = new CheckPlanFeatureUseCase(planLimitsService, billingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkAutoImport', () => {
    it('should allow autoImport for pro plan', async () => {
      billingService.getActiveSubscription.mockResolvedValue({
        plan: 'pro',
        status: 'active',
        renewAt: null,
      });
      planLimitsService.allowsAutoImport.mockReturnValue(true);

      await expect(useCase.checkAutoImport('user1')).resolves.not.toThrow();

      expect(billingService.getActiveSubscription).toHaveBeenCalledWith('user1');
      expect(planLimitsService.allowsAutoImport).toHaveBeenCalledWith('pro');
    });

    it('should allow autoImport for business plan', async () => {
      billingService.getActiveSubscription.mockResolvedValue({
        plan: 'business',
        status: 'active',
        renewAt: null,
      });
      planLimitsService.allowsAutoImport.mockReturnValue(true);

      await expect(useCase.checkAutoImport('user1')).resolves.not.toThrow();

      expect(planLimitsService.allowsAutoImport).toHaveBeenCalledWith('business');
    });

    it('should throw ForbiddenException for free plan', async () => {
      billingService.getActiveSubscription.mockResolvedValue({
        plan: 'free',
        status: 'active',
        renewAt: null,
      });
      planLimitsService.allowsAutoImport.mockReturnValue(false);

      await expect(useCase.checkAutoImport('user1')).rejects.toThrow(ForbiddenException);
      await expect(useCase.checkAutoImport('user1')).rejects.toThrow(
        "L'import automatique Gmail n'est pas disponible avec le plan free. Utilisez l'import manuel."
      );

      expect(planLimitsService.allowsAutoImport).toHaveBeenCalledWith('free');
    });

    it('should default to free plan when plan is null', async () => {
      billingService.getActiveSubscription.mockResolvedValue({
        plan: null,
        status: 'active',
        renewAt: null,
      });
      planLimitsService.allowsAutoImport.mockReturnValue(false);

      await expect(useCase.checkAutoImport('user1')).rejects.toThrow(ForbiddenException);

      expect(planLimitsService.allowsAutoImport).toHaveBeenCalledWith('free');
    });

    it('should default to free plan when plan is undefined', async () => {
      billingService.getActiveSubscription.mockResolvedValue({
        plan: undefined,
        status: 'active',
        renewAt: null,
      } as any);
      planLimitsService.allowsAutoImport.mockReturnValue(false);

      await expect(useCase.checkAutoImport('user1')).rejects.toThrow(ForbiddenException);

      expect(planLimitsService.allowsAutoImport).toHaveBeenCalledWith('free');
    });

    it('should handle uppercase plan names', async () => {
      billingService.getActiveSubscription.mockResolvedValue({
        plan: 'PRO',
        status: 'active',
        renewAt: null,
      } as any);
      planLimitsService.allowsAutoImport.mockReturnValue(true);

      await expect(useCase.checkAutoImport('user1')).resolves.not.toThrow();

      expect(planLimitsService.allowsAutoImport).toHaveBeenCalledWith('pro');
    });
  });

  describe('checkAutoSend', () => {
    it('should allow autoSend for business plan', async () => {
      billingService.getActiveSubscription.mockResolvedValue({
        plan: 'business',
        status: 'active',
        renewAt: null,
      });
      planLimitsService.allowsAutoAiSend.mockReturnValue(true);

      await expect(useCase.checkAutoSend('user1')).resolves.not.toThrow();

      expect(billingService.getActiveSubscription).toHaveBeenCalledWith('user1');
      expect(planLimitsService.allowsAutoAiSend).toHaveBeenCalledWith('business');
    });

    it('should throw ForbiddenException for free plan', async () => {
      billingService.getActiveSubscription.mockResolvedValue({
        plan: 'free',
        status: 'active',
        renewAt: null,
      });
      planLimitsService.allowsAutoAiSend.mockReturnValue(false);

      await expect(useCase.checkAutoSend('user1')).rejects.toThrow(ForbiddenException);
      await expect(useCase.checkAutoSend('user1')).rejects.toThrow(
        "L'envoi automatique de réponses IA n'est pas disponible avec le plan free."
      );

      expect(planLimitsService.allowsAutoAiSend).toHaveBeenCalledWith('free');
    });

    it('should throw ForbiddenException for pro plan', async () => {
      billingService.getActiveSubscription.mockResolvedValue({
        plan: 'pro',
        status: 'active',
        renewAt: null,
      });
      planLimitsService.allowsAutoAiSend.mockReturnValue(false);

      await expect(useCase.checkAutoSend('user1')).rejects.toThrow(ForbiddenException);
      await expect(useCase.checkAutoSend('user1')).rejects.toThrow(
        "L'envoi automatique de réponses IA n'est pas disponible avec le plan pro."
      );

      expect(planLimitsService.allowsAutoAiSend).toHaveBeenCalledWith('pro');
    });

    it('should default to free plan when plan is null', async () => {
      billingService.getActiveSubscription.mockResolvedValue({
        plan: null,
        status: 'active',
        renewAt: null,
      });
      planLimitsService.allowsAutoAiSend.mockReturnValue(false);

      await expect(useCase.checkAutoSend('user1')).rejects.toThrow(ForbiddenException);

      expect(planLimitsService.allowsAutoAiSend).toHaveBeenCalledWith('free');
    });

    it('should default to free plan when plan is undefined', async () => {
      billingService.getActiveSubscription.mockResolvedValue({
        plan: undefined,
        status: 'active',
        renewAt: null,
      } as any);
      planLimitsService.allowsAutoAiSend.mockReturnValue(false);

      await expect(useCase.checkAutoSend('user1')).rejects.toThrow(ForbiddenException);

      expect(planLimitsService.allowsAutoAiSend).toHaveBeenCalledWith('free');
    });
  });
});


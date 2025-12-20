import { ForbiddenException } from '@nestjs/common';

import { createPlanLimitsServiceMock } from 'src/tests/mocks/plan-limits-service.mock';
import { createBillingServiceMock } from 'src/tests/mocks/billing-service.mock';
import { createGmailRepositoryMock } from 'src/tests/mocks/gmail-repository.mock';

import { CheckGmailAccountLimitUseCase } from '../check-gmail-account-limit.usecase';

describe('CheckGmailAccountLimitUseCase', () => {
  let useCase: CheckGmailAccountLimitUseCase;
  let planLimitsService: ReturnType<typeof createPlanLimitsServiceMock>;
  let billingService: ReturnType<typeof createBillingServiceMock>;
  let gmailTokenRepository: ReturnType<typeof createGmailRepositoryMock>;

  beforeEach(() => {
    planLimitsService = createPlanLimitsServiceMock();
    billingService = createBillingServiceMock();
    gmailTokenRepository = createGmailRepositoryMock();
    useCase = new CheckGmailAccountLimitUseCase(
      planLimitsService,
      billingService,
      gmailTokenRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow connecting first Gmail account for free plan', async () => {
    billingService.getActiveSubscription.mockResolvedValue({
      plan: 'free',
      status: 'active',
      renewAt: null,
    });
    planLimitsService.getMaxGmailAccounts.mockReturnValue(1);
    gmailTokenRepository.hasToken.mockResolvedValue(false);

    await expect(useCase.execute('user1')).resolves.not.toThrow();

    expect(billingService.getActiveSubscription).toHaveBeenCalledWith('user1');
    expect(planLimitsService.getMaxGmailAccounts).toHaveBeenCalledWith('free');
    expect(gmailTokenRepository.hasToken).toHaveBeenCalledWith('user1');
  });

  it('should throw ForbiddenException when free plan user tries to add second account', async () => {
    billingService.getActiveSubscription.mockResolvedValue({
      plan: 'free',
      status: 'active',
      renewAt: null,
    });
    planLimitsService.getMaxGmailAccounts.mockReturnValue(1);
    gmailTokenRepository.hasToken.mockResolvedValue(true);

    await expect(useCase.execute('user1')).rejects.toThrow(ForbiddenException);
    await expect(useCase.execute('user1')).rejects.toThrow(
      'Votre plan free permet 1 compte Gmail. Veuillez supprimer le compte existant avant d\'en ajouter un nouveau.'
    );
  });

  it('should throw ForbiddenException when pro plan user tries to add second account', async () => {
    billingService.getActiveSubscription.mockResolvedValue({
      plan: 'pro',
      status: 'active',
      renewAt: null,
    });
    planLimitsService.getMaxGmailAccounts.mockReturnValue(1);
    gmailTokenRepository.hasToken.mockResolvedValue(true);

    await expect(useCase.execute('user1')).rejects.toThrow(ForbiddenException);
    await expect(useCase.execute('user1')).rejects.toThrow(
      'Votre plan pro permet 1 compte Gmail. Veuillez supprimer le compte existant avant d\'en ajouter un nouveau.'
    );
  });

  it('should allow connecting first Gmail account for pro plan', async () => {
    billingService.getActiveSubscription.mockResolvedValue({
      plan: 'pro',
      status: 'active',
      renewAt: null,
    });
    planLimitsService.getMaxGmailAccounts.mockReturnValue(1);
    gmailTokenRepository.hasToken.mockResolvedValue(false);

    await expect(useCase.execute('user1')).resolves.not.toThrow();
  });

  it('should allow connecting first Gmail account for business plan', async () => {
    billingService.getActiveSubscription.mockResolvedValue({
      plan: 'business',
      status: 'active',
      renewAt: null,
    });
    planLimitsService.getMaxGmailAccounts.mockReturnValue(3);
    gmailTokenRepository.hasToken.mockResolvedValue(false);

    await expect(useCase.execute('user1')).resolves.not.toThrow();

    expect(planLimitsService.getMaxGmailAccounts).toHaveBeenCalledWith('business');
  });

  it('should default to free plan when plan is null', async () => {
    billingService.getActiveSubscription.mockResolvedValue({
      plan: null,
      status: 'active',
      renewAt: null,
    });
    planLimitsService.getMaxGmailAccounts.mockReturnValue(1);
    gmailTokenRepository.hasToken.mockResolvedValue(false);

    await expect(useCase.execute('user1')).resolves.not.toThrow();

    expect(planLimitsService.getMaxGmailAccounts).toHaveBeenCalledWith('free');
  });

  it('should default to free plan when plan is undefined', async () => {
    billingService.getActiveSubscription.mockResolvedValue({
      plan: undefined,
      status: 'active',
      renewAt: null,
    } as any);
    planLimitsService.getMaxGmailAccounts.mockReturnValue(1);
    gmailTokenRepository.hasToken.mockResolvedValue(false);

    await expect(useCase.execute('user1')).resolves.not.toThrow();

    expect(planLimitsService.getMaxGmailAccounts).toHaveBeenCalledWith('free');
  });
});


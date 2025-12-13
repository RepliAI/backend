import { createBillingServiceMock } from 'src/tests/mocks/billing-service.mock';
import { GetSubscriptionUseCase } from '../get-subscription.usecase';

describe('GetSubscriptionUseCase', () => {
  let useCase: GetSubscriptionUseCase;
  let billingService: ReturnType<typeof createBillingServiceMock>;

  beforeEach(() => {
    billingService = createBillingServiceMock();
    useCase = new GetSubscriptionUseCase(billingService);
  });

  it('should return active subscription', async () => {
    const expectedSubscription = {
      plan: 'pro',
      renewAt: new Date('2024-12-31'),
      status: 'active',
    };

    billingService.getActiveSubscription.mockResolvedValue(expectedSubscription);

    const result = await useCase.execute('user1');

    expect(billingService.getActiveSubscription).toHaveBeenCalledWith('user1');
    expect(result).toEqual(expectedSubscription);
  });

  it('should return null values when no subscription exists', async () => {
    billingService.getActiveSubscription.mockResolvedValue({
      plan: null,
      renewAt: null,
      status: null,
    });

    const result = await useCase.execute('user1');

    expect(result.plan).toBeNull();
    expect(result.renewAt).toBeNull();
    expect(result.status).toBeNull();
  });
});
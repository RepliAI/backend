import { createSubscriptionRepoMock } from 'src/tests/mocks/subscription-repo.mock';
import { createBillingPaymentProviderMock } from 'src/tests/mocks/billing-payment-provider.mock';
import { CancelSubscriptionUseCase } from '../cancel-subscription.usecase';

describe('CancelSubscriptionUseCase', () => {
  let useCase: CancelSubscriptionUseCase;
  let subscriptionRepo: ReturnType<typeof createSubscriptionRepoMock>;
  let paymentProvider: ReturnType<typeof createBillingPaymentProviderMock>;

  beforeEach(() => {
    subscriptionRepo = createSubscriptionRepoMock();
    paymentProvider = createBillingPaymentProviderMock();
    useCase = new CancelSubscriptionUseCase(subscriptionRepo, paymentProvider);
  });

  it('should cancel subscription when it exists', async () => {
    const subscription = {
      id: 'sub1',
      userId: 'user1',
      stripeSubId: 'stripe-sub-1',
      plan: 'pro',
      status: 'active',
    };

    subscriptionRepo.findByUserId.mockResolvedValue(subscription);

    await useCase.execute('user1');

    expect(subscriptionRepo.findByUserId).toHaveBeenCalledWith('user1');
    expect(paymentProvider.cancelSubscription).toHaveBeenCalledWith('stripe-sub-1');
    expect(subscriptionRepo.updateSubscription).toHaveBeenCalledWith('sub1', {
      status: 'canceled',
      plan: 'free',
      stripeSubId: null,
      currentPeriodEnd: null,
    });
  });

  it('should do nothing when subscription does not exist', async () => {
    subscriptionRepo.findByUserId.mockResolvedValue(null);

    await useCase.execute('user1');

    expect(paymentProvider.cancelSubscription).not.toHaveBeenCalled();
    expect(subscriptionRepo.updateSubscription).not.toHaveBeenCalled();
  });

  it('should do nothing when subscription has no stripeSubId', async () => {
    const subscription = {
      id: 'sub1',
      userId: 'user1',
      stripeSubId: null,
      plan: 'free',
    };

    subscriptionRepo.findByUserId.mockResolvedValue(subscription);

    await useCase.execute('user1');

    expect(paymentProvider.cancelSubscription).not.toHaveBeenCalled();
    expect(subscriptionRepo.updateSubscription).not.toHaveBeenCalled();
  });
});
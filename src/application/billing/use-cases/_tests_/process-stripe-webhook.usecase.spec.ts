import { createSubscriptionRepoMock } from 'src/tests/mocks/subscription-repo.mock';
import { createBillingPaymentProviderMock } from 'src/tests/mocks/billing-payment-provider.mock';
import { createUserRepoMock } from 'src/tests/mocks/user-repo.mock';
import { ProcessStripeWebhookUseCase } from '../process-stripe-webhook.usecase';

describe('ProcessStripeWebhookUseCase', () => {
  let useCase: ProcessStripeWebhookUseCase;
  let subscriptionRepo: ReturnType<typeof createSubscriptionRepoMock>;
  let userRepo: ReturnType<typeof createUserRepoMock>;
  let paymentProvider: ReturnType<typeof createBillingPaymentProviderMock>;

  beforeAll(() => {
    process.env.STRIPE_PRICE_PRO = 'price_pro_test';
    process.env.STRIPE_PRICE_BUSINESS = 'price_business_test';
  });

  beforeEach(() => {
    subscriptionRepo = createSubscriptionRepoMock();
    userRepo = createUserRepoMock();
    paymentProvider = createBillingPaymentProviderMock();
    useCase = new ProcessStripeWebhookUseCase(
      subscriptionRepo,
      userRepo,
      paymentProvider,
    );
  });

  it('should handle checkout.session.completed event', async () => {
    const priceId = process.env.STRIPE_PRICE_PRO || 'price_pro_test';
    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          subscription: 'sub_123',
          customer_details: { email: 'user@example.com' },
          customer: 'cus_123',
        },
      },
    };

    const user = { id: 'user1', email: 'user@example.com' };
    const stripeSubscription = {
      plan: { id: priceId },
    };

    userRepo.findByEmail.mockResolvedValue(user as any);
    subscriptionRepo.findByUserId.mockResolvedValue(null);
    paymentProvider.getStripeSubscription.mockResolvedValue(stripeSubscription);
    subscriptionRepo.create.mockResolvedValue({ id: 'sub1' } as any);

    await useCase.execute(event);

    expect(paymentProvider.getStripeSubscription).toHaveBeenCalledWith('sub_123');
  });

  it('should handle invoice.payment_succeeded event', async () => {
    const event = {
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          subscription: 'sub_123',
          period_end: 1735689600,
        },
      },
    };

    const subscription = {
      id: 'sub1',
      stripeSubId: 'sub_123',
      nextPlan: null,
    };

    subscriptionRepo.findByStripeSubId.mockResolvedValue(subscription as any);

    await useCase.execute(event);

    expect(subscriptionRepo.findByStripeSubId).toHaveBeenCalledWith('sub_123');
    expect(subscriptionRepo.updateStripeSubscription).toHaveBeenCalled();
  });

  it('should handle customer.subscription.deleted event', async () => {
    const event = {
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_123',
        },
      },
    };

    const subscription = {
      id: 'sub1',
      stripeSubId: 'sub_123',
      plan: 'pro',
    };

    subscriptionRepo.findByStripeSubId.mockResolvedValue(subscription as any);

    await useCase.execute(event);

    expect(subscriptionRepo.findByStripeSubId).toHaveBeenCalledWith('sub_123');
    expect(subscriptionRepo.updateStripeSubscription).toHaveBeenCalled();
    expect(subscriptionRepo.updateSubscription).toHaveBeenCalledWith('sub1', {
      plan: 'free',
      nextPlan: null,
    });
  });

  it('should ignore unhandled event types', async () => {
    const event = {
      type: 'unknown.event',
      data: { object: {} },
    };

    await useCase.execute(event);

    expect(subscriptionRepo.findByUserId).not.toHaveBeenCalled();
    expect(paymentProvider.getStripeSubscription).not.toHaveBeenCalled();
  });
});
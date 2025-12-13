import { createBillingPaymentProviderMock } from 'src/tests/mocks/billing-payment-provider.mock';
import { createSubscriptionRepoMock } from 'src/tests/mocks/subscription-repo.mock';
import { createUserRepoMock } from 'src/tests/mocks/user-repo.mock';
import { CreateCheckoutSessionUseCase } from '../createCheckoutSession.usecase';

describe('CreateCheckoutSessionUseCase', () => {
    let useCase: CreateCheckoutSessionUseCase;
    let paymentProvider: ReturnType<typeof createBillingPaymentProviderMock>;
    let subscriptionRepo: ReturnType<typeof createSubscriptionRepoMock>;
    let userRepo: ReturnType<typeof createUserRepoMock>;

    beforeEach(() => {
        paymentProvider = createBillingPaymentProviderMock();
        subscriptionRepo = createSubscriptionRepoMock();
        userRepo = createUserRepoMock();
        useCase = new CreateCheckoutSessionUseCase(
            paymentProvider,
            subscriptionRepo,
            userRepo,
        );
    });

    it('should throw error when user does not exist', async () => {
        userRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute({ userId: 'user1', priceId: 'price1', plan: 'pro' }),
        ).rejects.toThrow('User not found');
    });

    it('should create checkout session when user has no subscription', async () => {
        const user = { id: 'user1', email: 'user@example.com' };
        userRepo.findById.mockResolvedValue(user as any);
        subscriptionRepo.findByUserId.mockResolvedValue(null);
        paymentProvider.createCheckoutSession.mockResolvedValue({ url: 'https://checkout.stripe.com' });

        const result = await useCase.execute({
            userId: 'user1',
            priceId: 'price1',
            plan: 'pro',
        });

        expect(paymentProvider.createCheckoutSession).toHaveBeenCalledWith('user@example.com', {
            userId: 'user1',
            priceId: 'price1',
            plan: 'pro',
        });
        expect(result.url).toBe('https://checkout.stripe.com');
    });

    it('should create checkout session when user has free plan', async () => {
        const user = { id: 'user1', email: 'user@example.com' };
        const subscription = { id: 'sub1', plan: 'free' };
        userRepo.findById.mockResolvedValue(user as any);
        subscriptionRepo.findByUserId.mockResolvedValue(subscription);
        paymentProvider.createCheckoutSession.mockResolvedValue({ url: 'https://checkout.stripe.com' });

        const result = await useCase.execute({
            userId: 'user1',
            priceId: 'price1',
            plan: 'pro',
        });

        expect(paymentProvider.createCheckoutSession).toHaveBeenCalled();
        expect(result.url).toBe('https://checkout.stripe.com');
    });

    it('should schedule plan change when switching to different plan', async () => {
        const user = { id: 'user1', email: 'user@example.com' };
        const subscription = {
            id: 'sub1',
            plan: 'pro',
            stripeSubId: 'stripe-sub-1',
        };
        userRepo.findById.mockResolvedValue(user as any);
        subscriptionRepo.findByUserId.mockResolvedValue(subscription);

        const result = await useCase.execute({
            userId: 'user1',
            priceId: 'price-business',
            plan: 'business',
        });

        expect(paymentProvider.schedulePlanChange).toHaveBeenCalledWith(
            'stripe-sub-1',
            'price-business',
        );
        expect(subscriptionRepo.updateNextPlan).toHaveBeenCalledWith('sub1', 'business');
        expect(result.url).toBeNull();
    });

    it('should schedule cancellation when switching to free', async () => {
        const user = { id: 'user1', email: 'user@example.com' };
        const subscription = {
            id: 'sub1',
            plan: 'pro',
            stripeSubId: 'stripe-sub-1',
        };
        userRepo.findById.mockResolvedValue(user as any);
        subscriptionRepo.findByUserId.mockResolvedValue(subscription);

        const result = await useCase.execute({
            userId: 'user1',
            priceId: 'price-free',
            plan: 'free',
        });

        expect(paymentProvider.scheduleCancellation).toHaveBeenCalledWith('stripe-sub-1');
        expect(subscriptionRepo.updateNextPlan).toHaveBeenCalledWith('sub1', 'free');
        expect(result.url).toBeNull();
    });
});
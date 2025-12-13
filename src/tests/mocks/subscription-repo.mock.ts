import { ISubscriptionRepository } from 'src/domain/billing/repositories/subscription.repository';

export function createSubscriptionRepoMock(): jest.Mocked<ISubscriptionRepository> {
    return {
        findByUserId: jest.fn(),
        create: jest.fn(),
        updateCustomerId: jest.fn(),
        updateSubscription: jest.fn(),
        findByStripeSubId: jest.fn(),
        upsertFromStripe: jest.fn(),
        updateStripeSubscription: jest.fn(),
        updateNextPlan: jest.fn(),
        updatePlanByStripeSubId: jest.fn(),
    };
}

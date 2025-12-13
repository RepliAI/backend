import { BillingService } from 'src/domain/billing/services/billing.service';

export function createBillingServiceMock(): jest.Mocked<BillingService> {
    return {
        createCheckoutSession: jest.fn(),
        getActiveSubscription: jest.fn(),
        cancelSubscription: jest.fn(),
    };
}
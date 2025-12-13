import { BillingPaymentProvider } from 'src/domain/billing/repositories/billing-payment.provider';

export function createBillingPaymentProviderMock(): jest.Mocked<BillingPaymentProvider> {
    return {
        createCheckoutSession: jest.fn(),
        cancelSubscription: jest.fn(),
        getStripeSubscription: jest.fn(),
        schedulePlanChange: jest.fn(),
        scheduleCancellation: jest.fn(),
    };
}
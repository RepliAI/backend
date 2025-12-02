export interface BillingPaymentProvider {
  createCheckoutSession(
    userEmail: string,
    params: {
      userId: string;
      priceId: string;
      successUrl: string;
      cancelUrl: string;
  }): Promise<{ url: string }>;

  cancelSubscription(subscriptionId: string): Promise<void>;
}

export const BILLING_PAYMENT_PROVIDER = "BILLING_PAYMENT_PROVIDER";
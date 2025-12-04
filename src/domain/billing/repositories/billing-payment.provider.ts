export interface BillingPaymentProvider {
  createCheckoutSession(
    userEmail: string,
    params: {
      userId: string;
      priceId: string;
      plan: string;
  }): Promise<{ url: string }>;

  cancelSubscription(subscriptionId: string): Promise<void>;
  getStripeSubscription(stripeSubId: string): Promise<any>;
  schedulePlanChange(stripeSubId: string, priceId: string): Promise<any>;
  scheduleCancellation(stripeSubId: string): Promise<any>;
}

export const BILLING_PAYMENT_PROVIDER = "BILLING_PAYMENT_PROVIDER";
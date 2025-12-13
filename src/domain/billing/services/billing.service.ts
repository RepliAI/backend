export interface BillingService {
  createCheckoutSession(
    userEmail: string,
    params: {
      userId: string;
      priceId: string;
    }): Promise<{ url: string }>;

  getActiveSubscription(userId: string): Promise<{
    plan: string | null;
    renewAt: Date | null;
    status: string | null;
  }>;

  cancelSubscription(userId: string): Promise<void>;
}

export const BILLING_SERVICE = "BILLING_SERVICE";
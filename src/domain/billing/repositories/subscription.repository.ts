export const SUBSCRIPTION_REPOSITORY = "SUBSCRIPTION_REPOSITORY";

export interface ISubscriptionRepository {
  findByUserId(userId: string): Promise<any | null>;
  create(data: {
    userId: string;
    plan: string;
    stripeCustomerId?: string | null;
  }): Promise<any>;

  updateCustomerId(id: string, customerId: string): Promise<any>;
  updateSubscription(
    id: string,
    data: {
      stripeSubId?: string;
      status?: string;
      plan?: string;
      currentPeriodEnd?: Date;
    }
  ): Promise<any>;
}
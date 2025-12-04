export const SUBSCRIPTION_REPOSITORY = "SUBSCRIPTION_REPOSITORY";

export interface ISubscriptionRepository {
  findByUserId(userId: string): Promise<any | null>;
  create(data: {
    userId: string;
    plan: string;
    nextPlan?: string | null;
    stripeCustomerId?: string | null;
  }): Promise<any>;

  updateCustomerId(id: string, customerId: string): Promise<any>;
  updateSubscription(
    id: string,
    data: {
      stripeSubId?: string;
      status?: string;
      plan?: string;
      nextPlan?: string | null;
      currentPeriodEnd?: Date;
    }
  ): Promise<any>;
  findByStripeSubId(stripeSubId: string): Promise<any | null>;
  upsertFromStripe(data: {
    userId: string;
    stripeSubId: string;
    plan: string;
    status: string;
    currentPeriodEnd: Date | null;
  }): Promise<any>;
  updateStripeSubscription(data: {
    stripeSubId: string;
    status: string;
    currentPeriodEnd: Date;
  }): Promise<any>;
  upsertFromStripe(data: {
    userId: string;
    plan: string;
    stripeCustomerId: string;
    stripeSubId: string;
    status: string;
    currentPeriodEnd: Date;
  }): Promise<any>;
  updateNextPlan(id: string, nextPlan: string | null): Promise<any>;
  updatePlanByStripeSubId(stripeSubId: string, plan: string): Promise<any>;
}
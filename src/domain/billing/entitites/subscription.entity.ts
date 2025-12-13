export class Subscription {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly plan: "FREE" | "PRO" | "BUSINESS",
    public readonly status: "active" | "trialing" | "canceled" | "incomplete",
    public readonly stripeCustomerId: string | null,
    public readonly stripeSubId: string | null,
    public readonly currentPeriodEnd: Date | null,
  ) { }
}
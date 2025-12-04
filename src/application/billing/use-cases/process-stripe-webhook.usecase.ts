import { Inject, Injectable, Logger } from "@nestjs/common";

import { BILLING_PAYMENT_PROVIDER, BillingPaymentProvider } from "src/domain/billing/repositories/billing-payment.provider";
import { ISubscriptionRepository, SUBSCRIPTION_REPOSITORY } from "src/domain/billing/repositories/subscription.repository";
import { IUserRepository, USER_REPOSITORY } from "src/domain/users/repositories/user.repository";

export interface StripeWebhookEvent {
  type: string;
  data: any;
}

const PLAN_MAP = {
  [process.env.STRIPE_PRICE_PRO]: "pro",
  [process.env.STRIPE_PRICE_BUSINESS]: "business",
};

@Injectable()
export class ProcessStripeWebhookUseCase {
  private readonly logger = new Logger(ProcessStripeWebhookUseCase.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(BILLING_PAYMENT_PROVIDER)
    private readonly paymentProvider: BillingPaymentProvider,
  ) { }

  async execute(event: StripeWebhookEvent) {
    this.logger.log("Processing Stripe event: " + event.type);

    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutSessionCompleted(event);
        break;

      case "invoice.payment_succeeded":
        await this.handleInvoicePaymentSucceeded(event);
        break;
      case "customer.subscription.deleted":
        await this.handleSubscriptionDeleted(event);
        break;
      default:
        this.logger.debug("Unhandled event: " + event.type);
    }
  }

  private async handleCheckoutSessionCompleted(event: StripeWebhookEvent) {
    const session = event.data.object;
  
    const stripeSubId = session.subscription;
    const email = session.customer_details?.email;
    const customerId = session.customer;

    const stripeSubscription = await this.paymentProvider.getStripeSubscription(
      stripeSubId
    );

    const priceId = stripeSubscription.plan.id;
    const newPlan = PLAN_MAP[priceId];
    if (!stripeSubId || !email || !priceId || !newPlan) {
      this.logger.error("Missing required metadata in checkout.session.completed");
      return;
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) return;

    const existing = await this.subscriptionRepository.findByUserId(user.id);

    if (!existing) {
      const sub = await this.subscriptionRepository.create({
        userId: user.id,
        plan: newPlan,
        stripeCustomerId: customerId,
      });
  
      await this.subscriptionRepository.updateSubscription(sub.id, {
        stripeSubId,
        status: "active",
      });
      return;
    }

    const oldPlan = existing.plan;

    await this.paymentProvider.schedulePlanChange(existing.stripeSubId!, priceId);
    if (newPlan === "free") {
      await this.paymentProvider.scheduleCancellation(stripeSubId);
    }
  }
  
  private async handleInvoicePaymentSucceeded(event: StripeWebhookEvent) {
    const invoice = event.data.object;

    const stripeSubId =
      invoice.subscription ??
      invoice.lines?.data?.[0]?.subscription ??
      invoice.parent?.subscription_details?.subscription;
  
    if (!stripeSubId) {
      this.logger.error("Missing subscription ID in invoice.payment_succeeded");
      return;
    }

    const subscription = await this.subscriptionRepository.findByStripeSubId(stripeSubId);
    if (!subscription) {
      this.logger.error("No subscription found in DB for " + stripeSubId);
      return;
    }

    const timestamp = invoice.period_end;
    if (!timestamp) {
      this.logger.error("Missing period_end in invoice");
      return;
    }
  
    const currentPeriodEnd = new Date(timestamp * 1000);
  
    await this.subscriptionRepository.updateStripeSubscription({
      stripeSubId,
      status: "active",
      currentPeriodEnd,
    });
  
    if (!subscription.nextPlan) {
      return;
    }

    const nextPlan = subscription.nextPlan;
    const nextPriceId =
      nextPlan === "business"
        ? process.env.STRIPE_PRICE_BUSINESS
        : process.env.STRIPE_PRICE_PRO;

    await this.paymentProvider.schedulePlanChange(
      stripeSubId,
      nextPriceId
    );

    await this.subscriptionRepository.updateSubscription(subscription.id, {
      plan: subscription.nextPlan,
      nextPlan: null,
    });
  }
  private async handleSubscriptionDeleted(event: StripeWebhookEvent) {
    const stripeSub = event.data.object;
    const stripeSubId = stripeSub.id;

    const subscription = await this.subscriptionRepository.findByStripeSubId(stripeSubId);
    if (!subscription) {
      this.logger.error("No subscription found for deletion event: " + stripeSubId);
      return;
    }

    await this.subscriptionRepository.updateStripeSubscription({
      stripeSubId,
      status: "canceled",
      currentPeriodEnd: new Date(),
    });

    await this.subscriptionRepository.updateSubscription(subscription.id, {
      plan: "free",
      nextPlan: null,
    });
  }
}
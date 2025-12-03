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
  ) {}

  async execute(event: StripeWebhookEvent) {
    this.logger.log("Processing Stripe event: " + event.type);

    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutSessionCompleted(event);
        break;

      case "invoice.payment_succeeded":
        await this.handleInvoicePaymentSucceeded(event);
        break;

      default:
        this.logger.debug("Unhandled event: " + event.type);
    }
  }

  private async handleCheckoutSessionCompleted(event: StripeWebhookEvent) {
    const session = event.data.object;
  
    const stripeSubId = session.subscription;
    const email = session.customer_details?.email;
    const stripeCustomerId = session.customer;
  
    if (!stripeSubId || !email) {
      this.logger.error("Missing data in checkout.session.completed");
      return;
    }
  
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      this.logger.error("User not found for email " + email);
      return;
    }
  
    const stripeSubscription = await this.paymentProvider.getStripeSubscription(
      stripeSubId
    );
  
    const stripePriceId = stripeSubscription.plan?.id;
    const plan = PLAN_MAP[stripePriceId];
    
    let subscription = await this.subscriptionRepository.findByUserId(user.id);
  
    if (!subscription) {
      this.logger.log("Creating subscription in DB for user " + user.id);
  
      subscription = await this.subscriptionRepository.create({
        userId: user.id,
        plan,
        stripeCustomerId,
      });
    }
  
    await this.subscriptionRepository.updateSubscription(subscription.id, {
      stripeSubId,
      status: "active",
      plan,
    });
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
  
    const timestamp = invoice.period_end;
    if (!timestamp) {
      this.logger.error("Missing period_end in invoice");
      return;
    }
  
    const currentPeriodEnd = new Date(timestamp * 1000);
  
    const stripeSubscription = await this.paymentProvider.getStripeSubscription(
      stripeSubId,
    );
  
    const priceId = stripeSubscription?.plan?.id;
    const plan = PLAN_MAP[priceId];
  
    const updated = await this.subscriptionRepository.updateStripeSubscription({
      stripeSubId,
      status: "active",
      currentPeriodEnd,
    });
  
    if (plan) {
      await this.subscriptionRepository.updatePlanByStripeSubId(
        stripeSubId,
        plan,
      );
    }
  
    this.logger.log(`✔ Subscription updated after invoice: ${stripeSubId}`);
  }
}
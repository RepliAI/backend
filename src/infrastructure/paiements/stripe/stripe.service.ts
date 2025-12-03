import { Injectable } from "@nestjs/common";
import { Stripe } from "stripe";

import { BillingPaymentProvider } from "src/domain/billing/repositories/billing-payment.provider";

import { createStripeClient } from "./stripe.config";

@Injectable()
export class StripePaymentService implements BillingPaymentProvider {
  private stripe: Stripe;

  constructor() {
    this.stripe = createStripeClient();
  }

  async getStripeSubscription(stripeSubId: string) {
    return await this.stripe.subscriptions.retrieve(stripeSubId);
  }

  async createCheckoutSession(
    userEmail: string,
    params: {
      userId: string;
      priceId: string;
      plan: string;
  }): Promise<{ url: string }> {
    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: userEmail,
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          plan: params.plan
        },
      },
      success_url: `${process.env.STRIPE_REDIRECT_URI}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.STRIPE_REDIRECT_URI}/cancel?session_id={CHECKOUT_SESSION_ID}`,
    });

    return { url: session.url! };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.stripe.subscriptions.cancel(subscriptionId);
  }
}
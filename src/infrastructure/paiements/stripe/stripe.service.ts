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

  async createCheckoutSession(
    userEmail: string,
    params: {
      userId: string;
      priceId: string;
      successUrl: string;
      cancelUrl: string;
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
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });

    return { url: session.url! };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.stripe.subscriptions.cancel(subscriptionId);
  }
}

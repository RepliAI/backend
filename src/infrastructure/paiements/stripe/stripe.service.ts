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
      metadata: {
        plan: params.plan,
      },
      subscription_data: {
        metadata: {
          plan: params.plan,
          priceId: params.priceId,
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

  async schedulePlanChange(stripeSubId: string, newPriceId: string) {
    const sub = await this.stripe.subscriptions.retrieve(stripeSubId, {
      expand: ["items.data.price"],
    });
  
    const items = sub.items.data;
  
    if (items.length === 0) {
      throw new Error(`No subscription items found on subscription ${stripeSubId}`);
    }
  
    const mainItem = items[0];
  
    const updatedItems: any[] = [
      {
        id: mainItem.id,
        price: newPriceId,
        quantity: 1,
      },
    ];
  
    if (items.length > 1) {
      for (const extra of items.slice(1)) {
        updatedItems.push({
          id: extra.id,
          deleted: true,
        });
      }
    }
  
    return this.stripe.subscriptions.update(stripeSubId, {
      proration_behavior: "none",
      items: updatedItems,
    });
  }

  async scheduleCancellation(stripeSubId: string) {
    return this.stripe.subscriptions.update(stripeSubId, {
      cancel_at_period_end: true,
    });
  }
}
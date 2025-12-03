import { Injectable, BadRequestException } from "@nestjs/common";
import Stripe from "stripe";
import { createStripeClient } from "src/infrastructure/paiements/stripe/stripe.config";

@Injectable()
export class StripeWebhookService {
  private stripe = createStripeClient();

  verifySignature(rawBody: Buffer, signature: string, secret: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch (err) {
      throw new BadRequestException(`Invalid Stripe signature: ${err.message}`);
    }
  }
}
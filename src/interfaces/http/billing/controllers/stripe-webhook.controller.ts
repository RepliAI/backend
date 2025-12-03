import { Controller, Headers, Post, Req } from "@nestjs/common";
import { ProcessStripeWebhookUseCase } from "src/application/billing/use-cases/process-stripe-webhook.usecase";
import { StripeWebhookService } from "src/infrastructure/billing/stripe/stripe-webhook.service";

@Controller("billing/webhook")
export class StripeWebhookController {
  constructor(
    private readonly processor: ProcessStripeWebhookUseCase,
    private readonly verifier: StripeWebhookService,
  ) {}

  @Post()
  async handleWebhook(
    @Req() req: any,
    @Headers("stripe-signature") signature: string,
  ) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    const event = this.verifier.verifySignature(req.body, signature, secret);

    await this.processor.execute({
      type: event.type,
      data: event.data,
    });

    return { received: true };
  }
}
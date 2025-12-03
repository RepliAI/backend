import { Module } from "@nestjs/common";

import { SUBSCRIPTION_REPOSITORY } from "src/domain/billing/repositories/subscription.repository";
import { BILLING_SERVICE } from "src/domain/billing/services/billing.service";
import { BILLING_PAYMENT_PROVIDER } from "src/domain/billing/repositories/billing-payment.provider";

import { BillingServiceImpl } from "./billing.service";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaSubscriptionRepository } from "./prisma-subscription.repository";
import { StripePaymentService } from "../paiements/stripe/stripe.service";
import { StripeWebhookService } from "./stripe/stripe-webhook.service";

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: BILLING_PAYMENT_PROVIDER,
      useClass: StripePaymentService,
    },

    {
      provide: BILLING_SERVICE,
      useClass: BillingServiceImpl,
    },

    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: PrismaSubscriptionRepository,
    },
    StripeWebhookService
  ],
  exports: [
    BILLING_SERVICE,
    SUBSCRIPTION_REPOSITORY,
    BILLING_PAYMENT_PROVIDER,
    StripeWebhookService
  ],
})
export class BillingInfrastructureModule {}
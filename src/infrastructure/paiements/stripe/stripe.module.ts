import { Module } from "@nestjs/common";

import { BILLING_PAYMENT_PROVIDER } from "src/domain/billing/repositories/billing-payment.provider";

import { StripePaymentService } from "./stripe.service";

@Module({
  providers: [
    {
      provide: BILLING_PAYMENT_PROVIDER,
      useClass: StripePaymentService,
    },
  ],
  exports: [BILLING_PAYMENT_PROVIDER],
})
export class StripeModule {}

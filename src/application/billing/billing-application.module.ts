import { Module } from "@nestjs/common";

import { PrismaModule } from "src/infrastructure/prisma/prisma.module";
import { StripePaymentService } from "src/infrastructure/paiements/stripe/stripe.service";
import { BILLING_PAYMENT_PROVIDER } from "src/domain/billing/repositories/billing-payment.provider";
import { AuthModule } from "src/interfaces/http/auth/auth.module";
import { BillingInfrastructureModule } from "src/infrastructure/billing/billing-infrastructure.module";

import { CreateCheckoutSessionUseCase } from "./use-cases/createCheckoutSession.usecase";
import { GetSubscriptionUseCase } from "./use-cases/get-subscription.usecase";
import { CancelSubscriptionUseCase } from "./use-cases/cancel-subscription.usecase";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BillingInfrastructureModule,
  ],
  providers: [
    {
      provide: BILLING_PAYMENT_PROVIDER,
      useClass: StripePaymentService,
    },
    CreateCheckoutSessionUseCase,
    GetSubscriptionUseCase,
    CancelSubscriptionUseCase,
  ],
  exports: [
    CreateCheckoutSessionUseCase,
    GetSubscriptionUseCase,
    CancelSubscriptionUseCase,
  ],
})
export class BillingApplicationModule {}
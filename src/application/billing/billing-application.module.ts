import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { AuthModule } from 'src/interfaces/http/auth/auth.module';
import { BillingInfrastructureModule } from 'src/infrastructure/billing/billing-infrastructure.module';

import { CreateCheckoutSessionUseCase } from './use-cases/createCheckoutSession.usecase';
import { GetSubscriptionUseCase } from './use-cases/get-subscription.usecase';
import { CancelSubscriptionUseCase } from './use-cases/cancel-subscription.usecase';
import { ProcessStripeWebhookUseCase } from './use-cases/process-stripe-webhook.usecase';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BillingInfrastructureModule,
  ],
  providers: [
    CreateCheckoutSessionUseCase,
    GetSubscriptionUseCase,
    CancelSubscriptionUseCase,
    ProcessStripeWebhookUseCase,
  ],
  exports: [
    CreateCheckoutSessionUseCase,
    GetSubscriptionUseCase,
    CancelSubscriptionUseCase,
    ProcessStripeWebhookUseCase,
  ],
})
export class BillingApplicationModule { }
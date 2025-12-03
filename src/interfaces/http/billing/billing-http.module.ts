import { Module } from '@nestjs/common';

import { BillingApplicationModule } from 'src/application/billing/billing-application.module';
import { StripeWebhookService } from 'src/infrastructure/billing/stripe/stripe-webhook.service';

import { BillingController } from './controllers/billing.controller';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';
import { BillingRedirectController } from './controllers/billing-redirect.controller';

@Module({
  imports: [BillingApplicationModule],
  controllers: [BillingController, StripeWebhookController, BillingRedirectController],
  providers: [
    StripeWebhookService,
  ],
})
export class BillingHttpModule {}
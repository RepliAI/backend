import { Inject, Injectable } from '@nestjs/common';

import {
  SUBSCRIPTION_REPOSITORY,
  ISubscriptionRepository,
} from 'src/domain/billing/repositories/subscription.repository';
import {
  BILLING_PAYMENT_PROVIDER,
  BillingPaymentProvider,
} from 'src/domain/billing/repositories/billing-payment.provider';

@Injectable()
export class CancelSubscriptionUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptions: ISubscriptionRepository,
    @Inject(BILLING_PAYMENT_PROVIDER)
    private readonly payment: BillingPaymentProvider,
  ) {}

  async execute(userId: string) {
    const subscription = await this.subscriptions.findByUserId(userId);

    if (!subscription || !subscription.stripeSubId) {
      return;
    }

    await this.payment.cancelSubscription(subscription.stripeSubId);

    await this.subscriptions.updateSubscription(subscription.id, {
      status: 'canceled',
      plan: 'free',
      stripeSubId: null,
      currentPeriodEnd: null,
    });
  }
}
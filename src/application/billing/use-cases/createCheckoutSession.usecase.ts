import { Inject, Injectable } from '@nestjs/common';

import {
  BILLING_PAYMENT_PROVIDER,
  BillingPaymentProvider,
} from 'src/domain/billing/repositories/billing-payment.provider';
import {
  SUBSCRIPTION_REPOSITORY,
  ISubscriptionRepository,
} from 'src/domain/billing/repositories/subscription.repository';
import {
  IUserRepository,
  USER_REPOSITORY,
} from 'src/domain/users/repositories/user.repository';

@Injectable()
export class CreateCheckoutSessionUseCase {
  constructor(
    @Inject(BILLING_PAYMENT_PROVIDER)
    private readonly paymentProvider: BillingPaymentProvider,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(params: { userId: string; priceId: string; plan: string }) {
    const { userId, priceId, plan } = params;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const userEmail = user.email;
    const existing = await this.subscriptionRepository.findByUserId(userId);

    if (!existing || existing.plan === 'free') {
      return this.paymentProvider.createCheckoutSession(userEmail, {
        userId,
        priceId,
        plan,
      });
    }

    if (existing.plan !== plan && plan !== 'free') {
      await this.paymentProvider.schedulePlanChange(
        existing.stripeSubId!,
        priceId,
      );
      await this.subscriptionRepository.updateNextPlan(existing.id, plan);
      return { url: null };
    }

    if (plan === 'free') {
      await this.paymentProvider.scheduleCancellation(existing.stripeSubId!);
      await this.subscriptionRepository.updateNextPlan(existing.id, 'free');
      return { url: null };
    }
  }
}
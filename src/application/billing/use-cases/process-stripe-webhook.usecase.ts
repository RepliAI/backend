import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  BILLING_PAYMENT_PROVIDER,
  BillingPaymentProvider,
} from 'src/domain/billing/repositories/billing-payment.provider';
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPOSITORY,
} from 'src/domain/billing/repositories/subscription.repository';
import {
  IUserRepository,
  USER_REPOSITORY,
} from 'src/domain/users/repositories/user.repository';

export interface StripeWebhookEvent {
  type: string;
  data: any;
}

const PLAN_MAP = {
  [process.env.STRIPE_PRICE_PRO]: 'pro',
  [process.env.STRIPE_PRICE_BUSINESS]: 'business',
};

@Injectable()
export class ProcessStripeWebhookUseCase {
  private readonly logger = new Logger(ProcessStripeWebhookUseCase.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(BILLING_PAYMENT_PROVIDER)
    private readonly paymentProvider: BillingPaymentProvider,
  ) { }

  async execute(event: StripeWebhookEvent) {
    this.logger.log('Processing Stripe event: ' + event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event);
        break;

      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event);
        break;
      default:
        this.logger.debug('Unhandled event: ' + event.type);
    }
  }

  private async handleCheckoutSessionCompleted(event: StripeWebhookEvent) {
    const session = event.data.object;

    const stripeSubId = session.subscription;
    const email = session.customer_details?.email;
    const customerId = session.customer;

    const stripeSubscription = await this.paymentProvider.getStripeSubscription(stripeSubId);

    const priceId = stripeSubscription.plan.id;
    const newPlan = PLAN_MAP[priceId];

    if (!stripeSubId || !email || !priceId || !newPlan) {
      this.logger.error(
        'Missing required metadata in checkout.session.completed',
      );
      return;
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) return;

    const existing = await this.subscriptionRepository.findByUserId(user.id);

    let currentPeriodEnd: Date | null;
    if (stripeSubscription.current_period_end) {
      currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
    } else {
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
      currentPeriodEnd = oneMonthFromNow;
    }

    if (!existing || existing.status === 'canceled' || !existing.stripeSubId) {
      if (existing && existing.status === 'canceled') {
        if (customerId) {
          await this.subscriptionRepository.updateCustomerId(existing.id, customerId);
        }

        await this.subscriptionRepository.updateSubscription(existing.id, {
          stripeSubId,
          status: 'active',
          plan: newPlan,
          currentPeriodEnd,
          nextPlan: null,
        });
      } else {
        const sub = await this.subscriptionRepository.create({
          userId: user.id,
          plan: newPlan,
          stripeCustomerId: customerId,
        });

        await this.subscriptionRepository.updateSubscription(sub.id, {
          stripeSubId,
          status: 'active',
          currentPeriodEnd,
        });
      }
      return;
    }

    if (existing.stripeSubId && existing.stripeSubId !== stripeSubId) {

      if (customerId) {
        await this.subscriptionRepository.updateCustomerId(existing.id, customerId);
      }

      await this.subscriptionRepository.updateSubscription(existing.id, {
        stripeSubId,
        status: 'active',
        plan: newPlan,
        currentPeriodEnd,
        nextPlan: null,
      });
      return;
    }

    try {
      await this.paymentProvider.schedulePlanChange(
        existing.stripeSubId!,
        priceId,
      );
    } catch (error) {
      this.logger.error(
        `Error scheduling plan change for subscription ${existing.stripeSubId}: ${error.message}`
      );
    }

    if (newPlan === 'free') {
      await this.paymentProvider.scheduleCancellation(stripeSubId);
    }
  }

  private async handleInvoicePaymentSucceeded(event: StripeWebhookEvent) {
    const invoice = event.data.object;

    const stripeSubId =
      invoice.subscription ??
      invoice.lines?.data?.[0]?.subscription ??
      invoice.parent?.subscription_details?.subscription;

    if (!stripeSubId) {
      this.logger.error('Missing subscription ID in invoice.payment_succeeded');
      return;
    }

    const subscription =
      await this.subscriptionRepository.findByStripeSubId(stripeSubId);
    if (!subscription) {
      this.logger.error('No subscription found in DB for ' + stripeSubId);
      return;
    }

    let stripeSubscription;
    try {
      stripeSubscription = await this.paymentProvider.getStripeSubscription(stripeSubId);
    } catch (error) {
      this.logger.error(`Error fetching Stripe subscription ${stripeSubId}: ${error.message}`);
      return;
    }

    const timestamp = invoice.period_end;
    if (!timestamp) {
      this.logger.error('Missing period_end in invoice');
      return;
    }

    const currentPeriodEnd = new Date(timestamp * 1000);

    if (stripeSubscription.status === 'canceled') {
      await this.subscriptionRepository.updateSubscription(subscription.id, {
        currentPeriodEnd,
        nextPlan: null,
      });

      return;
    }

    if (stripeSubscription.status !== 'active' && stripeSubscription.status !== 'trialing') {

      if (subscription.nextPlan) {
        await this.subscriptionRepository.updateSubscription(subscription.id, {
          nextPlan: null,
        });
      }

      return;
    }

    await this.subscriptionRepository.updateStripeSubscription({
      stripeSubId,
      status: 'active',
      currentPeriodEnd,
    });

    if (!subscription.nextPlan) {
      return;
    }

    const nextPlan = subscription.nextPlan;
    const nextPriceId =
      nextPlan === 'business'
        ? process.env.STRIPE_PRICE_BUSINESS
        : process.env.STRIPE_PRICE_PRO;

    try {
      await this.paymentProvider.schedulePlanChange(stripeSubId, nextPriceId);

      await this.subscriptionRepository.updateSubscription(subscription.id, {
        plan: subscription.nextPlan,
        nextPlan: null,
      });
    } catch (error) {
      this.logger.error(
        `Error scheduling plan change for subscription ${stripeSubId}: ${error.message}`
      );
    }
  }
  private async handleSubscriptionDeleted(event: StripeWebhookEvent) {
    const stripeSub = event.data.object;
    const stripeSubId = stripeSub.id;

    const subscription =
      await this.subscriptionRepository.findByStripeSubId(stripeSubId);
    if (!subscription) {
      this.logger.error(
        'No subscription found for deletion event: ' + stripeSubId,
      );
      return;
    }

    await this.subscriptionRepository.updateStripeSubscription({
      stripeSubId,
      status: 'canceled',
      currentPeriodEnd: new Date(),
    });

    await this.subscriptionRepository.updateSubscription(subscription.id, {
      plan: 'free',
      nextPlan: null,
    });
  }
}
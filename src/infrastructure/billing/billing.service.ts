import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "src/infrastructure/prisma/prisma.service";
import {
  BillingService,
} from "src/domain/billing/services/billing.service";
import { BILLING_PAYMENT_PROVIDER, BillingPaymentProvider } from "src/domain/billing/repositories/billing-payment.provider";

@Injectable()
export class BillingServiceImpl implements BillingService {
  constructor(
    private readonly prisma: PrismaService,

    @Inject(BILLING_PAYMENT_PROVIDER)
    private readonly payment: BillingPaymentProvider,
  ) {}

  async createCheckoutSession(
    userEmail: string,
    params: {
      userId: string;
      priceId: string;
      successUrl: string;
      cancelUrl: string;
  }): Promise<{ url: string }> {
    return this.payment.createCheckoutSession(userEmail, params);
  }

  async getActiveSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: "active" },
    });
  
    if (!subscription) {
      return {
        plan: "free",
        status: "active",
        renewAt: null,
      };
    }
  
    return {
      plan: subscription.plan,
      status: subscription.status,
      renewAt: subscription.currentPeriodEnd,
    };
  }

  async cancelSubscription(userId: string): Promise<void> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: "active" },
    });

    if (!subscription) return;

    await this.payment.cancelSubscription(subscription.stripeSubId);

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "canceled" },
    });
  }
}
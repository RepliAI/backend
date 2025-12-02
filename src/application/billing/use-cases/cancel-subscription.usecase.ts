import { Inject, Injectable } from "@nestjs/common";

import {
  BILLING_SERVICE,
  BillingService,
} from "src/domain/billing/services/billing.service";

@Injectable()
export class CancelSubscriptionUseCase {
  constructor(
    @Inject(BILLING_SERVICE)
    private readonly billing: BillingService,
  ) {}

  execute(userId: string) {
    return this.billing.cancelSubscription(userId);
  }
}
import { Inject, Injectable } from "@nestjs/common";

import {
  BILLING_SERVICE,
  BillingService,
} from "src/domain/billing/services/billing.service";
import { IUserRepository, USER_REPOSITORY } from "src/domain/users/repositories/user.repository";

@Injectable()
export class CreateCheckoutSessionUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
    @Inject(BILLING_SERVICE)
    private readonly billing: BillingService,
  ) {}

  async execute(input: {
    userId: string;
    priceId: string;
    plan:string;
  }) {
    const user = await this.users.findById(input.userId);
    if (!user) {
      throw new Error("User not found");
    }

    return this.billing.createCheckoutSession(user.email, input);
  }
}
import { Controller, Post, Body, Get, Delete, UseGuards } from '@nestjs/common';

import { GetSubscriptionUseCase } from 'src/application/billing/use-cases/get-subscription.usecase';
import { CancelSubscriptionUseCase } from 'src/application/billing/use-cases/cancel-subscription.usecase';
import { CreateCheckoutSessionUseCase } from 'src/application/billing/use-cases/createCheckoutSession.usecase';

import { CreateCheckoutDTO } from '../dtos/create-checkout.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/security/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(
    private readonly createCheckout: CreateCheckoutSessionUseCase,
    private readonly getSubscriptionUseCase: GetSubscriptionUseCase,
    private readonly cancelSubscriptionUseCase: CancelSubscriptionUseCase,
  ) {}

  @Post('checkout')
  async createCheckoutSession(
    @CurrentUser() user: any,
    @Body() dto: CreateCheckoutDTO,
  ) {
    return this.createCheckout.execute({
      userId: user.userId,
      priceId: dto.priceId,
      successUrl: `${process.env.FRONTEND_URL}/billing/success`,
      cancelUrl: `${process.env.FRONTEND_URL}/billing/cancel`,
    });
  }

  @Get('subscription')
  async getSubscription(@CurrentUser() user: any) {
    return this.getSubscriptionUseCase.execute(user.userId);
  }

  @Delete('subscription')
  async cancelSubscription(@CurrentUser() user: any) {
    return this.cancelSubscriptionUseCase.execute(user.userId);
  }
}
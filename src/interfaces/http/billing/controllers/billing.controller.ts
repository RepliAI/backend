import { Controller, Post, Body, Get, Delete, UseGuards } from '@nestjs/common';

import { GetSubscriptionUseCase } from 'src/application/billing/use-cases/get-subscription.usecase';
import { CancelSubscriptionUseCase } from 'src/application/billing/use-cases/cancel-subscription.usecase';
import { CreateCheckoutSessionUseCase } from 'src/application/billing/use-cases/createCheckoutSession.usecase';

import { CreateCheckoutDTO } from '../dtos/create-checkout.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/security/jwt-auth.guard';
import { CurrentUser as CurrentUserType } from '../../shared/types/current-user.interface';
import { GoFreeResponse } from '../dto/go-free-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(
    private readonly createCheckout: CreateCheckoutSessionUseCase,
    private readonly getSubscriptionUseCase: GetSubscriptionUseCase,
    private readonly cancelSubscriptionUseCase: CancelSubscriptionUseCase,
  ) { }

  @Post("free")
  @UseGuards(JwtAuthGuard)
  async goFree(@CurrentUser() user: CurrentUserType): Promise<GoFreeResponse> {
    await this.cancelSubscriptionUseCase.execute(user.userId);
    return { status: "ok", message: "You are now on the free plan" };
  }

  @Post('checkout')
  async createCheckoutSession(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreateCheckoutDTO,
  ): Promise<{ url: string }> {
    return this.createCheckout.execute({
      userId: user.userId,
      priceId: dto.priceId,
      plan: dto.plan,
    });
  }

  @Get('subscription')
  async getSubscription(@CurrentUser() user: CurrentUserType): Promise<unknown> {
    return this.getSubscriptionUseCase.execute(user.userId);
  }

  @Delete('subscription')
  async cancelSubscription(@CurrentUser() user: CurrentUserType): Promise<unknown> {
    return this.cancelSubscriptionUseCase.execute(user.userId);
  }
}
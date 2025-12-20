import { Inject, Injectable, ForbiddenException } from '@nestjs/common';

import { IPlanLimitsService, PLAN_LIMITS } from 'src/domain/plans/services/plan-limits.service';
import { IAiUsageTrackingRepository, AI_USAGE_TRACKING_REPOSITORY } from 'src/domain/plans/repositories/ai-usage-tracking.repository';
import { BILLING_SERVICE, BillingService } from 'src/domain/billing/services/billing.service';
import { PlanType } from 'src/domain/plans/entities/plan-limits.entity';

@Injectable()
export class CheckAiResponseLimitUseCase {
  constructor(
    @Inject(PLAN_LIMITS)
    private readonly planLimitsService: IPlanLimitsService,
    @Inject(AI_USAGE_TRACKING_REPOSITORY)
    private readonly aiUsageTracking: IAiUsageTrackingRepository,
    @Inject(BILLING_SERVICE)
    private readonly billingService: BillingService,
  ) {}

  async execute(userId: string): Promise<void> {
    const subscription = await this.billingService.getActiveSubscription(userId);
    const plan = (subscription.plan?.toLowerCase() || 'free') as PlanType;
    
    const limit = this.planLimitsService.getAiResponseLimit(plan);
    
    if (limit === null) {
      return;
    }

    const currentUsage = await this.aiUsageTracking.getCurrentMonthUsage(userId);
    
    if (currentUsage >= limit) {
      throw new ForbiddenException(
        `Vous avez atteint la limite de ${limit} réponses IA par mois pour le plan ${plan}.`
      );
    }
  }

  async incrementUsage(userId: string): Promise<void> {
    await this.aiUsageTracking.incrementUsage(userId);
  }
}
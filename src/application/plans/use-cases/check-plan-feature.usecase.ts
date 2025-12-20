import { ForbiddenException, Inject, Injectable } from "@nestjs/common";

import { BILLING_SERVICE, BillingService } from "src/domain/billing/services/billing.service";
import { PlanType } from "src/domain/plans/entities/plan-limits.entity";
import { PLAN_LIMITS } from "src/domain/plans/services/plan-limits.service";
import { IPlanLimitsService } from "src/domain/plans/services/plan-limits.service";

@Injectable()
export class CheckPlanFeatureUseCase {
    constructor(
        @Inject(PLAN_LIMITS)
        private readonly planLimitsService: IPlanLimitsService,
        @Inject(BILLING_SERVICE)
        private readonly billingService: BillingService
    ) { }

    async checkAutoImport(userId: string): Promise<void> {
        const subscription = await this.billingService.getActiveSubscription(userId);
        const plan = (subscription.plan?.toLowerCase() || 'free') as PlanType;

        if (!this.planLimitsService.allowsAutoImport(plan)) {
            throw new ForbiddenException(
                `L'import automatique Gmail n'est pas disponible avec le plan ${plan}. Utilisez l'import manuel.`
            );
        }
    }

    async checkAutoSend(userId: string): Promise<void> {
        const subscription = await this.billingService.getActiveSubscription(userId);
        const plan = (subscription.plan?.toLowerCase() || 'free') as PlanType;

        if (!this.planLimitsService.allowsAutoAiSend(plan)) {
            throw new ForbiddenException(
                `L'envoi automatique de réponses IA n'est pas disponible avec le plan ${plan}.`
            );
        }
    }
}
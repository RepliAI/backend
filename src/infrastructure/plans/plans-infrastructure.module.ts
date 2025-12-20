import { Module } from '@nestjs/common';

import { PLAN_LIMITS } from 'src/domain/plans/services/plan-limits.service';
import { AI_USAGE_TRACKING_REPOSITORY } from 'src/domain/plans/repositories/ai-usage-tracking.repository';
import { PrismaAiUsageTrackingRepository } from './repositories/prisma-ai-usage-tracking.repository';

import { PlanLimitsServiceImpl } from './services/plan-limits.service';

@Module({
    providers: [
        {
            provide: PLAN_LIMITS,
            useClass: PlanLimitsServiceImpl,
        },
        {
            provide: AI_USAGE_TRACKING_REPOSITORY,
            useClass: PrismaAiUsageTrackingRepository,
        },
    ],
    exports: [
        PLAN_LIMITS,
        AI_USAGE_TRACKING_REPOSITORY
    ],
})
export class PlansInfrastructureModule { };
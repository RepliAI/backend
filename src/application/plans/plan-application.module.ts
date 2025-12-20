import { Module } from '@nestjs/common';

import { PlansInfrastructureModule } from 'src/infrastructure/plans/plans-infrastructure.module';
import { BillingInfrastructureModule } from 'src/infrastructure/billing/billing-infrastructure.module';
import { GmailInfrastructureModule } from 'src/infrastructure/gmail/gmail-infrastructure.module';

import { CheckPlanFeatureUseCase } from './use-cases/check-plan-feature.usecase';
import { CheckGmailAccountLimitUseCase } from './use-cases/check-gmail-account-limit.usecase';
import { CheckAiResponseLimitUseCase } from './use-cases/check-ai-response-limit.usecase';

@Module({
    imports: [
        PlansInfrastructureModule,
        BillingInfrastructureModule,
        GmailInfrastructureModule,
    ],
    providers: [
        CheckPlanFeatureUseCase,
        CheckGmailAccountLimitUseCase,
        CheckAiResponseLimitUseCase,
    ],
    exports: [
        CheckPlanFeatureUseCase,
        CheckGmailAccountLimitUseCase,
        CheckAiResponseLimitUseCase,
    ],
})
export class PlansApplicationModule { }
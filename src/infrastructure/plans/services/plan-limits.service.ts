import { Injectable } from '@nestjs/common';
import { PlanLimitsEntity, PlanType } from 'src/domain/plans/entities/plan-limits.entity';
import { 
  IPlanLimitsService, 
} from 'src/domain/plans/services/plan-limits.service';

@Injectable()
export class PlanLimitsServiceImpl implements IPlanLimitsService {
  private readonly limits: Map<PlanType, PlanLimitsEntity> = new Map([
    [
      'free',
      new PlanLimitsEntity(
        'free',
        20, 
        1,
        null,
        false,
        false,
      ),
    ],
    [
      'pro',
      new PlanLimitsEntity(
        'pro',
        null,
        1,
        null,
        true,
        true,
    )],
    [
      'business', 
      new PlanLimitsEntity(
        'business',
        null,
        3,
        0.5,
        true,
        true,
      ),
    ],
  ]);

  getPlanLimits(plan: PlanType): PlanLimitsEntity {
    const normalizedPlan = plan.toLowerCase() as PlanType;
    return this.limits.get(normalizedPlan) || this.limits.get('free')!;
  }

  getMaxGmailAccounts(plan: PlanType): number {
    return this.getPlanLimits(plan).maxGmailAccounts;
  }

  allowsAutoImport(plan: PlanType): boolean {
    return this.getPlanLimits(plan).allowsAutoImport;
  }

  allowsAutoAiSend(plan: PlanType): boolean {
    return this.getPlanLimits(plan).allowsAutoSend;
  }

  getAiResponseLimit(plan: PlanType): number | null {
    return this.getPlanLimits(plan).maxAiResponsesPerMonth;
  }

  getAutoImportInterval(plan: PlanType): number | null {
    return this.getPlanLimits(plan).autoImportIntervalMinutes;
  }
}
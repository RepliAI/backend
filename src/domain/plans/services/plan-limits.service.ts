import { PlanType, PlanLimitsEntity } from "../entities/plan-limits.entity";

export const PLAN_LIMITS = 'PLAN_LIMITS_SERVICE';

export interface IPlanLimitsService {
    getPlanLimits(plan: PlanType): PlanLimitsEntity;
    getMaxGmailAccounts(plan: PlanType): number;
    allowsAutoImport(plan: PlanType): boolean;
    allowsAutoAiSend(plan: PlanType): boolean;
    getAiResponseLimit(plan: PlanType): number | null;
    getAutoImportInterval(plan: PlanType): number | null;
}
export type PlanType = 'free' | 'pro' | 'business';

export class PlanLimitsEntity {
    constructor(
        public readonly plan: PlanType,
        public readonly maxAiResponsesPerMonth: number | null,
        public readonly maxGmailAccounts: number,
        public readonly autoImportIntervalMinutes: number | null,
        public readonly allowsAutoImport: boolean,
        public readonly allowsAutoSend: boolean,
    ) { }

    canUseAiResponse(currentUsage: number): boolean {
        if(this.maxAiResponsesPerMonth === null) return true;
        return currentUsage < this.maxAiResponsesPerMonth;
    }
}
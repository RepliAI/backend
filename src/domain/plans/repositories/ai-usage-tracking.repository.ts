export const AI_USAGE_TRACKING_REPOSITORY = 'AI_USAGE_TRACKING_REPOSITORY';

export interface IAiUsageTrackingRepository {
  getCurrentMonthUsage(userId: string): Promise<number>;
  incrementUsage(userId: string): Promise<void>;
}
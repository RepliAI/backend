export const GMAIL_TOKEN_REPOSITORY = "GMAIL_TOKEN_REPOSITORY";

export interface IGmailTokenRepository {
  hasToken(userId: string): Promise<boolean>;
  findUsersEligibleForAutoImport(plan: 'pro' | 'business'): Promise<{ userId: string }[]>;
}
export const PASSWORD_RESET_SERVICE = "PASSWORD_RESET_SERVICE";

export interface IPasswordResetService {
  generateResetToken(userId: string): Promise<string>;
  verifyResetToken(token: string): Promise<{ userId: string }>;
  generateEmailChangeToken(userId: string, newEmail: string): Promise<string>;
  verifyEmailChangeToken(token: string): Promise<{ userId: string; newEmail: string }>;
}
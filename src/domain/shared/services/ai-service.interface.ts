export const I_AI_SERVICE = "I_AI_SERVICE";

export interface IAiService {
  generateReply(params: { system: string; user: string }): Promise<string>;
  isSafeForAutoReply(messageContent: string): Promise<boolean>;
}
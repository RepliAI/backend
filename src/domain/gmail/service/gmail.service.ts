export interface GmailMessage {
    id: string;
    from: string;
    threadId: string;
    to: string;
    subject: string;
    date: Date;
    content: string;
}

export const IGMAIL_SERVICE = "IGMAIL_SERVICE";

export interface IGmailService {
    generateAuthUrl(userId: string): string;
    handleOAuthCallback(code: string, stateUserId: string): Promise<void>;
    fetchRecentMessages(userId: string, maxResults?: number): Promise<GmailMessage[]>;
    sendReply(params: {userId: string, threadId: string, to: string, subject: string, content: string}): Promise<string>;
}
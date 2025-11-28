export interface GmailMessage {
    id: string;
    from: string;
    to: string;
    subject: string;
    date: Date;
    content: string;
}

export interface IGmailService {
    generateAuthUrl(userId: string): string;
    handleOAuthCallback(code: string, stateUserId: string): Promise<void>;
    fetchRecentMessages(userId: string, maxResults?: number): Promise<GmailMessage[]>;
}
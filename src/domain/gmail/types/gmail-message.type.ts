export interface GmailMessage {
    id: string;
    from: string;
    to: string;
    subject: string;
    date: Date;
    content: string;
}
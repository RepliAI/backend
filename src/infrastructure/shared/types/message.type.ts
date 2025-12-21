export interface Message {
    id: string;
    ticketId: string;
    gmailId: string | null;
    from: string;
    to: string;
    content: string;
    date: Date;
    threadId: string | null;
    isRisky?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
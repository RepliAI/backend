/**
 * Type représentant un message tel que retourné par la base de données
 */
export interface Message {
    id: string;
    ticketId: string;
    gmailId: string | null;
    from: string;
    to: string;
    content: string;
    date: Date;
    threadId: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
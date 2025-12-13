import { Message } from './message.type';

/**
 * Type représentant un ticket tel que retourné par la base de données
 */
export interface Ticket {
    id: string;
    userId: string;
    subject: string;
    status: string;
    createdAt: Date;
    updatedAt?: Date;
    messages?: Message[];
}
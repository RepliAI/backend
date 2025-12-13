/**
 * Types pour les clauses WHERE de requêtes
 */
export interface DateFilter {
    gte?: Date;
    lte?: Date;
}

export interface StringFilter {
    contains?: string;
    mode?: 'insensitive' | 'default';
}

export interface TicketWhereClause {
    userId?: string;
    status?: string;
    createdAt?: DateFilter;
    subject?: StringFilter;
    OR?: Array<{
        subject?: StringFilter;
        messages?: {
            some: {
                content?: StringFilter;
            };
        };
    }>;
}
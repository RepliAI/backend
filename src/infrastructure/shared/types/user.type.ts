/**
 * Type représentant un utilisateur tel que retourné par la base de données
 */
export interface User {
    id: string;
    email: string;
    passwordHash: string;
    refreshTokenHash: string | null;
    createdAt: Date;
    updatedAt?: Date;
}
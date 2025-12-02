import { UserPreferences } from "../entities/user-preferences.entity";

export const USER_PREFERENCES_REPOSITORY = "USER_PREFERENCES_REPOSITORY";

export interface IUserPreferencesRepository {
    getByUserId(userId: string): Promise<UserPreferences | null>;
    upsert(
        userId: string,
        data: { tone: string; signature: string, autoImport: boolean, autoAiSend: boolean },
    ): Promise<UserPreferences>;
}
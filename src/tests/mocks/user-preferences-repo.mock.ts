import { IUserPreferencesRepository } from 'src/domain/user-preferences/repositories/user-preferences.repository';

export function createUserPreferencesRepoMock(): jest.Mocked<IUserPreferencesRepository> {
    return {
        getByUserId: jest.fn(),
        upsert: jest.fn(),
    };
}
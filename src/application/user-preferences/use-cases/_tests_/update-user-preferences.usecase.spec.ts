import { createUserPreferencesRepoMock } from 'src/tests/mocks/user-preferences-repo.mock';
import { UpdateUserPreferencesUseCase, UpdateUserPreferencesInput } from '../update-user-preferences.usecase';

describe('UpdateUserPreferencesUseCase', () => {
    let useCase: UpdateUserPreferencesUseCase;
    let userPreferencesRepo: ReturnType<typeof createUserPreferencesRepoMock>;

    beforeEach(() => {
        userPreferencesRepo = createUserPreferencesRepoMock();
        useCase = new UpdateUserPreferencesUseCase(userPreferencesRepo);
    });

    it('should upsert user preferences', async () => {
        const input = new UpdateUserPreferencesInput('friendly', 'Best regards', true, false);
        const expectedPreferences = {
            id: 'pref1',
            userId: 'user1',
            tone: 'friendly',
            signature: 'Best regards',
            autoImport: true,
            autoAiSend: false,
        };

        userPreferencesRepo.upsert.mockResolvedValue(expectedPreferences as any);

        const result = await useCase.execute('user1', input);

        expect(userPreferencesRepo.upsert).toHaveBeenCalledWith('user1', {
            tone: 'friendly',
            signature: 'Best regards',
            autoImport: true,
            autoAiSend: false,
        });
        expect(result).toEqual(expectedPreferences);
    });

    it('should handle partial updates', async () => {
        const input = new UpdateUserPreferencesInput('neutral');
        const expectedPreferences = {
            id: 'pref1',
            userId: 'user1',
            tone: 'neutral',
            signature: '',
            autoImport: false,
            autoAiSend: false,
        };

        userPreferencesRepo.upsert.mockResolvedValue(expectedPreferences as any);

        await useCase.execute('user1', input);

        expect(userPreferencesRepo.upsert).toHaveBeenCalledWith('user1', {
            tone: 'neutral',
            signature: undefined,
            autoImport: undefined,
            autoAiSend: undefined,
        });
    });
});
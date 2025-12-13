import { createUserPreferencesRepoMock } from 'src/tests/mocks/user-preferences-repo.mock';
import { GetUserPreferencesUseCase } from '../get-user-preferences.usecase';

describe('GetUserPreferencesUseCase', () => {
    let useCase: GetUserPreferencesUseCase;
    let userPreferencesRepo: ReturnType<typeof createUserPreferencesRepoMock>;

    beforeEach(() => {
        userPreferencesRepo = createUserPreferencesRepoMock();
        useCase = new GetUserPreferencesUseCase(userPreferencesRepo);
    });

    it('should return default values when preferences do not exist', async () => {
        userPreferencesRepo.getByUserId.mockResolvedValue(null);

        const result = await useCase.execute('user1');

        expect(result.tone).toBe('neutral');
        expect(result.signature).toBe('');
        expect(result.autoImport).toBe(false);
        expect(result.autoAiSend).toBe(false);
        expect(userPreferencesRepo.getByUserId).toHaveBeenCalledWith('user1');
    });

    it('should return user preferences when they exist', async () => {
        userPreferencesRepo.getByUserId.mockResolvedValue({
            id: 'pref1',
            userId: 'user1',
            tone: 'friendly',
            signature: 'Best regards',
            autoImport: true,
            autoAiSend: true,
        } as any);

        const result = await useCase.execute('user1');

        expect(result.tone).toBe('friendly');
        expect(result.signature).toBe('Best regards');
        expect(result.autoImport).toBe(true);
        expect(result.autoAiSend).toBe(true);
    });

    it('should use defaults for missing preference fields', async () => {
        userPreferencesRepo.getByUserId.mockResolvedValue({
            id: 'pref1',
            userId: 'user1',
            tone: 'formal',
        } as any);

        const result = await useCase.execute('user1');

        expect(result.tone).toBe('formal');
        expect(result.signature).toBe('');
        expect(result.autoImport).toBe(false);
        expect(result.autoAiSend).toBe(false);
    });
});
import { ForbiddenException } from '@nestjs/common';


import { createUserPreferencesRepoMock } from 'src/tests/mocks/user-preferences-repo.mock';
import { UpdateUserPreferencesUseCase, UpdateUserPreferencesInput } from '../update-user-preferences.usecase';
import { CheckPlanFeatureUseCase } from 'src/application/plans/use-cases/check-plan-feature.usecase';

const createCheckPlanFeatureUseCaseMock = () => ({
  checkAutoImport: jest.fn(),
  checkAutoSend: jest.fn(),
});

describe('UpdateUserPreferencesUseCase', () => {
    let useCase: UpdateUserPreferencesUseCase;
    let userPreferencesRepo: ReturnType<typeof createUserPreferencesRepoMock>;
    let checkPlanFeature: ReturnType<typeof createCheckPlanFeatureUseCaseMock>;

    beforeEach(() => {
        userPreferencesRepo = createUserPreferencesRepoMock();
        checkPlanFeature = createCheckPlanFeatureUseCaseMock();
        useCase = new UpdateUserPreferencesUseCase(userPreferencesRepo, checkPlanFeature as any);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should upsert user preferences without plan checks when autoImport and autoAiSend are false', async () => {
        const input = new UpdateUserPreferencesInput('friendly', 'Best regards', false, false);
        const expectedPreferences = {
            id: 'pref1',
            userId: 'user1',
            tone: 'friendly',
            signature: 'Best regards',
            autoImport: false,
            autoAiSend: false,
        };

        userPreferencesRepo.getByUserId.mockResolvedValue(null);
        userPreferencesRepo.upsert.mockResolvedValue(expectedPreferences as any);

        const result = await useCase.execute('user1', input);

        expect(checkPlanFeature.checkAutoImport).not.toHaveBeenCalled();
        expect(checkPlanFeature.checkAutoSend).not.toHaveBeenCalled();
        expect(userPreferencesRepo.upsert).toHaveBeenCalledWith('user1', {
            tone: 'friendly',
            signature: 'Best regards',
            autoImport: false,
            autoAiSend: false,
        });
        expect(result).toEqual(expectedPreferences);
    });

    it('should check plan feature when autoImport is true', async () => {
        const input = new UpdateUserPreferencesInput('friendly', 'Best regards', true, false);
        const expectedPreferences = {
            id: 'pref1',
            userId: 'user1',
            tone: 'friendly',
            signature: 'Best regards',
            autoImport: true,
            autoAiSend: false,
        };

        userPreferencesRepo.getByUserId.mockResolvedValue(null);
        checkPlanFeature.checkAutoImport.mockResolvedValue(undefined);
        userPreferencesRepo.upsert.mockResolvedValue(expectedPreferences as any);

        const result = await useCase.execute('user1', input);

        expect(checkPlanFeature.checkAutoImport).toHaveBeenCalledWith('user1');
        expect(checkPlanFeature.checkAutoSend).not.toHaveBeenCalled();
        expect(userPreferencesRepo.upsert).toHaveBeenCalledWith('user1', {
            tone: 'friendly',
            signature: 'Best regards',
            autoImport: true,
            autoAiSend: false,
        });
        expect(result).toEqual(expectedPreferences);
    });

    it('should check plan feature when autoAiSend is true', async () => {
        const input = new UpdateUserPreferencesInput('friendly', 'Best regards', false, true);
        const expectedPreferences = {
            id: 'pref1',
            userId: 'user1',
            tone: 'friendly',
            signature: 'Best regards',
            autoImport: false,
            autoAiSend: true,
        };

        userPreferencesRepo.getByUserId.mockResolvedValue(null);
        checkPlanFeature.checkAutoSend.mockResolvedValue(undefined);
        userPreferencesRepo.upsert.mockResolvedValue(expectedPreferences as any);

        const result = await useCase.execute('user1', input);

        expect(checkPlanFeature.checkAutoImport).not.toHaveBeenCalled();
        expect(checkPlanFeature.checkAutoSend).toHaveBeenCalledWith('user1');
        expect(userPreferencesRepo.upsert).toHaveBeenCalledWith('user1', {
            tone: 'friendly',
            signature: 'Best regards',
            autoImport: false,
            autoAiSend: true,
        });
        expect(result).toEqual(expectedPreferences);
    });

    it('should check both plan features when both are true', async () => {
        const input = new UpdateUserPreferencesInput('friendly', 'Best regards', true, true);
        const expectedPreferences = {
            id: 'pref1',
            userId: 'user1',
            tone: 'friendly',
            signature: 'Best regards',
            autoImport: true,
            autoAiSend: true,
        };

        userPreferencesRepo.getByUserId.mockResolvedValue(null);
        checkPlanFeature.checkAutoImport.mockResolvedValue(undefined);
        checkPlanFeature.checkAutoSend.mockResolvedValue(undefined);
        userPreferencesRepo.upsert.mockResolvedValue(expectedPreferences as any);

        const result = await useCase.execute('user1', input);

        expect(checkPlanFeature.checkAutoImport).toHaveBeenCalledWith('user1');
        expect(checkPlanFeature.checkAutoSend).toHaveBeenCalledWith('user1');
        expect(userPreferencesRepo.upsert).toHaveBeenCalledWith('user1', {
            tone: 'friendly',
            signature: 'Best regards',
            autoImport: true,
            autoAiSend: true,
        });
        expect(result).toEqual(expectedPreferences);
    });

    it('should throw ForbiddenException when autoImport is true but plan does not allow', async () => {
        const input = new UpdateUserPreferencesInput('friendly', 'Best regards', true, false);

        userPreferencesRepo.getByUserId.mockResolvedValue(null);
        checkPlanFeature.checkAutoImport.mockRejectedValue(
            new ForbiddenException('Plan does not allow autoImport')
        );

        await expect(useCase.execute('user1', input)).rejects.toThrow(ForbiddenException);
        expect(checkPlanFeature.checkAutoImport).toHaveBeenCalledWith('user1');
        expect(userPreferencesRepo.upsert).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when autoAiSend is true but plan does not allow', async () => {
        const input = new UpdateUserPreferencesInput('friendly', 'Best regards', false, true);

        userPreferencesRepo.getByUserId.mockResolvedValue(null);
        checkPlanFeature.checkAutoSend.mockRejectedValue(
            new ForbiddenException('Plan does not allow autoAiSend')
        );

        await expect(useCase.execute('user1', input)).rejects.toThrow(ForbiddenException);
        expect(checkPlanFeature.checkAutoSend).toHaveBeenCalledWith('user1');
        expect(userPreferencesRepo.upsert).not.toHaveBeenCalled();
    });

    it('should merge with existing preferences when partial update', async () => {
        const existingPrefs = {
            id: 'pref1',
            userId: 'user1',
            tone: 'neutral',
            signature: 'Original signature',
            autoImport: false,
            autoAiSend: false,
        };
        const input = new UpdateUserPreferencesInput('friendly');
        const expectedPreferences = {
            ...existingPrefs,
            tone: 'friendly',
        };

        userPreferencesRepo.getByUserId.mockResolvedValue(existingPrefs as any);
        userPreferencesRepo.upsert.mockResolvedValue(expectedPreferences as any);

        await useCase.execute('user1', input);

        expect(userPreferencesRepo.upsert).toHaveBeenCalledWith('user1', {
            tone: 'friendly',
            signature: 'Original signature',
            autoImport: false,
            autoAiSend: false,
        });
        expect(checkPlanFeature.checkAutoImport).not.toHaveBeenCalled();
        expect(checkPlanFeature.checkAutoSend).not.toHaveBeenCalled();
    });

    it('should use default values when no existing preferences and partial input', async () => {
        const input = new UpdateUserPreferencesInput('neutral');
        const expectedPreferences = {
            id: 'pref1',
            userId: 'user1',
            tone: 'neutral',
            signature: '',
            autoImport: false,
            autoAiSend: false,
        };

        userPreferencesRepo.getByUserId.mockResolvedValue(null);
        userPreferencesRepo.upsert.mockResolvedValue(expectedPreferences as any);

        await useCase.execute('user1', input);

        expect(userPreferencesRepo.upsert).toHaveBeenCalledWith('user1', {
            tone: 'neutral',
            signature: '',
            autoImport: false,
            autoAiSend: false,
        });
    });

    it('should not check plan when autoImport is set to false (explicit disable)', async () => {
        const existingPrefs = {
            id: 'pref1',
            userId: 'user1',
            tone: 'neutral',
            signature: '',
            autoImport: true,
            autoAiSend: false,
        };
        const input = new UpdateUserPreferencesInput(undefined, undefined, false);

        userPreferencesRepo.getByUserId.mockResolvedValue(existingPrefs as any);
        userPreferencesRepo.upsert.mockResolvedValue({
            ...existingPrefs,
            autoImport: false,
        } as any);

        await useCase.execute('user1', input);

        expect(checkPlanFeature.checkAutoImport).not.toHaveBeenCalled();
        expect(userPreferencesRepo.upsert).toHaveBeenCalledWith('user1', {
            tone: 'neutral',
            signature: '',
            autoImport: false,
            autoAiSend: false,
        });
    });

    it('should not check plan when autoAiSend is set to false (explicit disable)', async () => {
        const existingPrefs = {
            id: 'pref1',
            userId: 'user1',
            tone: 'neutral',
            signature: '',
            autoImport: false,
            autoAiSend: true,
        };
        const input = new UpdateUserPreferencesInput(undefined, undefined, undefined, false);

        userPreferencesRepo.getByUserId.mockResolvedValue(existingPrefs as any);
        userPreferencesRepo.upsert.mockResolvedValue({
            ...existingPrefs,
            autoAiSend: false,
        } as any);

        await useCase.execute('user1', input);

        expect(checkPlanFeature.checkAutoSend).not.toHaveBeenCalled();
        expect(userPreferencesRepo.upsert).toHaveBeenCalledWith('user1', {
            tone: 'neutral',
            signature: '',
            autoImport: false,
            autoAiSend: false,
        });
    });
});

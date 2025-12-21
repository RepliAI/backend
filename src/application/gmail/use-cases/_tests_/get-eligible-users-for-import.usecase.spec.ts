import { GetEligibleUsersForImportUseCase, GetEligibleUsersForImportOutput } from '../get-eligible-users-for-import.usecase';
import { createGmailRepositoryMock } from 'src/tests/mocks/gmail-repository.mock';

describe('GetEligibleUsersForImportUseCase', () => {
  let useCase: GetEligibleUsersForImportUseCase;
  let gmailTokenRepository: ReturnType<typeof createGmailRepositoryMock>;

  beforeEach(() => {
    gmailTokenRepository = createGmailRepositoryMock();
    useCase = new GetEligibleUsersForImportUseCase(gmailTokenRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return eligible users for pro plan', async () => {
    const mockUsers = [
      { userId: 'user1' },
      { userId: 'user2' },
    ];

    gmailTokenRepository.findUsersEligibleForAutoImport.mockResolvedValue(mockUsers);

    const result = await useCase.execute('pro');

    expect(result).toBeInstanceOf(GetEligibleUsersForImportOutput);
    expect(result.userIds).toEqual(['user1', 'user2']);
    expect(gmailTokenRepository.findUsersEligibleForAutoImport).toHaveBeenCalledWith('pro');
    expect(gmailTokenRepository.findUsersEligibleForAutoImport).toHaveBeenCalledTimes(1);
  });

  it('should return eligible users for business plan', async () => {
    const mockUsers = [
      { userId: 'user3' },
    ];

    gmailTokenRepository.findUsersEligibleForAutoImport.mockResolvedValue(mockUsers);

    const result = await useCase.execute('business');

    expect(result).toBeInstanceOf(GetEligibleUsersForImportOutput);
    expect(result.userIds).toEqual(['user3']);
    expect(gmailTokenRepository.findUsersEligibleForAutoImport).toHaveBeenCalledWith('business');
  });

  it('should return empty array when no eligible users', async () => {
    gmailTokenRepository.findUsersEligibleForAutoImport.mockResolvedValue([]);

    const result = await useCase.execute('pro');

    expect(result.userIds).toEqual([]);
    expect(result.userIds.length).toBe(0);
  });

  it('should map userId correctly from repository response', async () => {
    const mockUsers = [
      { userId: 'user1' },
      { userId: 'user2' },
      { userId: 'user3' },
    ];

    gmailTokenRepository.findUsersEligibleForAutoImport.mockResolvedValue(mockUsers);

    const result = await useCase.execute('business');

    expect(result.userIds).toHaveLength(3);
    expect(result.userIds).toContain('user1');
    expect(result.userIds).toContain('user2');
    expect(result.userIds).toContain('user3');
  });

  it('should propagate repository errors', async () => {
    const error = new Error('Database error');
    gmailTokenRepository.findUsersEligibleForAutoImport.mockRejectedValue(error);

    await expect(useCase.execute('pro')).rejects.toThrow('Database error');
    expect(gmailTokenRepository.findUsersEligibleForAutoImport).toHaveBeenCalledWith('pro');
  });
});
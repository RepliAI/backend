import { ForbiddenException } from '@nestjs/common';
import { IGmailService } from 'src/domain/gmail/service/gmail.service';

import { HandleGmailCallbackUseCase } from '../handle-gmail-callback.usecase';
import { HandleGmailCallbackInput } from '../../dto/handle-gmail-callback.dto';
import { CheckGmailAccountLimitUseCase } from 'src/application/plans/use-cases/check-gmail-account-limit.usecase';

const createCheckGmailAccountLimitUseCaseMock = () => ({
  execute: jest.fn(),
});

describe('HandleGmailCallbackUseCase', () => {
  let useCase: HandleGmailCallbackUseCase;
  let gmailService: jest.Mocked<IGmailService>;
  let checkGmailAccountLimit: ReturnType<typeof createCheckGmailAccountLimitUseCaseMock>;

  beforeEach(() => {
    gmailService = {
      handleOAuthCallback: jest.fn().mockResolvedValue(undefined),
    } as any;
    checkGmailAccountLimit = createCheckGmailAccountLimitUseCaseMock();
    useCase = new HandleGmailCallbackUseCase(gmailService, checkGmailAccountLimit as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should check Gmail account limit before calling gmailService', async () => {
    checkGmailAccountLimit.execute.mockResolvedValue(undefined);

    const input = new HandleGmailCallbackInput();
    input.code = 'auth-code-123';
    input.stateUserId = 'user-123';

    await useCase.execute(input);

    expect(checkGmailAccountLimit.execute).toHaveBeenCalledWith('user-123');
    expect(checkGmailAccountLimit.execute).toHaveBeenCalledTimes(1);
    expect(gmailService.handleOAuthCallback).toHaveBeenCalledTimes(1);
  });

  it('should call gmailService.handleOAuthCallback with code and userId after limit check', async () => {
    checkGmailAccountLimit.execute.mockResolvedValue(undefined);

    const input = new HandleGmailCallbackInput();
    input.code = 'auth-code-123';
    input.stateUserId = 'user-123';

    await useCase.execute(input);

    expect(checkGmailAccountLimit.execute).toHaveBeenCalledWith('user-123');
    expect(gmailService.handleOAuthCallback).toHaveBeenCalledTimes(1);
    expect(gmailService.handleOAuthCallback).toHaveBeenCalledWith(
      'auth-code-123',
      'user-123',
    );
  });

  it('should throw ForbiddenException when limit check fails', async () => {
    checkGmailAccountLimit.execute.mockRejectedValue(
      new ForbiddenException('Gmail account limit reached')
    );

    const input = new HandleGmailCallbackInput();
    input.code = 'auth-code-123';
    input.stateUserId = 'user-123';

    await expect(useCase.execute(input)).rejects.toThrow(ForbiddenException);
    await expect(useCase.execute(input)).rejects.toThrow('Gmail account limit reached');

    expect(checkGmailAccountLimit.execute).toHaveBeenCalledWith('user-123');
    expect(gmailService.handleOAuthCallback).not.toHaveBeenCalled();
  });

  it('should not call gmailService when limit check fails', async () => {
    checkGmailAccountLimit.execute.mockRejectedValue(
      new ForbiddenException('Account limit reached')
    );

    const input = new HandleGmailCallbackInput();
    input.code = 'auth-code-123';
    input.stateUserId = 'user-123';

    try {
      await useCase.execute(input);
    } catch (error) {
      // Expected to throw
    }

    expect(gmailService.handleOAuthCallback).not.toHaveBeenCalled();
  });
});
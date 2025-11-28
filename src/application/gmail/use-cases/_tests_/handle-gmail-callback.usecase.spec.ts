import { IGmailService } from 'src/domain/gmail/service/gmail.service';

import { HandleGmailCallbackUseCase } from '../handle-gmail-callback.usecase';
import { HandleGmailCallbackInput } from '../../dto/handle-gmail-callback.dto';

describe('HandleGmailCallbackUseCase', () => {
  it('should call gmailService.handleOAuthCallback with code and userId', async () => {
    const gmailService: IGmailService = {
      handleOAuthCallback: jest.fn().mockResolvedValue(undefined),
    } as any;

    const useCase = new HandleGmailCallbackUseCase(gmailService);

    const input = new HandleGmailCallbackInput('auth-code-123', 'user-123');

    await useCase.execute(input);

    expect(gmailService.handleOAuthCallback).toHaveBeenCalledTimes(1);
    expect(gmailService.handleOAuthCallback).toHaveBeenCalledWith(
      'auth-code-123',
      'user-123',
    );
  });
});
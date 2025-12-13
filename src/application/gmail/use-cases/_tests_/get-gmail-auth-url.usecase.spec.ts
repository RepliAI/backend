import { IGmailService } from 'src/domain/gmail/service/gmail.service';

import { GetGmailAuthUrlInput } from '../../dto/get-gmail-url.dto';
import { GetGmailAuthUrlUseCase } from '../get-gmail-auth-url.usecase';

describe('GetGmailAuthUrlUseCase', () => {
  it('should return auth url from gmail service', async () => {
    const gmailService: IGmailService = {
      generateAuthUrl: jest.fn().mockReturnValue('https://google.com/auth'),
    } as any;

    const useCase = new GetGmailAuthUrlUseCase(gmailService);

    const input = new GetGmailAuthUrlInput();
    input.userId = 'user123';
    const result = await useCase.execute(input);

    expect(result.url).toBe('https://google.com/auth');
    expect(gmailService.generateAuthUrl).toHaveBeenCalledWith('user123');
  });
});
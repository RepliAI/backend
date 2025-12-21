import { OpenAiService } from 'src/infrastructure/integrations/openai/openai.service';

export function createOpenAiServiceMock(): jest.Mocked<OpenAiService> {
  return {
    generateReply: jest.fn(),
    isSafeForAutoReply: jest.fn(),
  } as any;
}

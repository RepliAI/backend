import { OpenAiService } from 'src/infrastructure/integrations/openai/openai.service';
import { IAiService } from 'src/domain/shared/services/ai-service.interface';

export function createOpenAiServiceMock(): jest.Mocked<OpenAiService> {
  return {
    generateReply: jest.fn(),
    isSafeForAutoReply: jest.fn(),
  } as any;
}

// Alias pour compatibilité avec les nouveaux tests utilisant l'interface
export const createAiServiceMock = () => {
  return {
    generateReply: jest.fn(),
    isSafeForAutoReply: jest.fn(),
  } as jest.Mocked<IAiService>;
};


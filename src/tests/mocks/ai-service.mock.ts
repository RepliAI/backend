import { IAiService } from 'src/domain/shared/services/ai-service.interface';

export function createAiServiceMock(): jest.Mocked<IAiService> {
  return {
    generateReply: jest.fn(),
    isSafeForAutoReply: jest.fn(),
  } as any;
}


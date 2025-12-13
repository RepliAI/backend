import { IGmailTokenRepository } from 'src/domain/gmail/repositories/gmail-token.repository';

export function createGmailRepositoryMock(): jest.Mocked<IGmailTokenRepository> {
  return {
    hasToken: jest.fn(),

  };
}
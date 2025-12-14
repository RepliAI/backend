// src/tests/mocks/gmail-service.mock.ts

import { IGmailService } from 'src/domain/gmail/service/gmail.service';

export function createGmailServiceMock(): jest.Mocked<IGmailService> {
  return {
    generateAuthUrl: jest.fn(),
    handleOAuthCallback: jest.fn(),
    fetchRecentMessages: jest.fn(),
    sendReply: jest.fn(),
    getAllConnectedUsers: jest.fn(),
    removeInvalidToken: jest.fn(),
  };
}
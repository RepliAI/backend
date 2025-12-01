import { ITicketRepository } from 'src/domain/tickets/repositories/ticket.repository';

export function createTicketRepoMock(): jest.Mocked<ITicketRepository> {
  return {
    findAllByUser: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    listWithFilters: jest.fn(),
    findBySubjectAndUser: jest.fn(),
    findMessageByGmailId: jest.fn(),
    addMessage: jest.fn(),
    updateStatus: jest.fn(),
    findByThreadId: jest.fn(),
  };
}
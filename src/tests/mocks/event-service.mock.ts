import { IEventService } from 'src/domain/shared/services/event-service.interface';

export function createEventServiceMock(): jest.Mocked<IEventService> {
  return {
    emitNewTicket: jest.fn(),
    emitNewMessage: jest.fn(),
  } as any;
}


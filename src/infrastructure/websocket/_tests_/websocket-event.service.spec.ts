import { WebSocketEventService } from '../websocket-event.service';
import { Server } from 'socket.io';

describe('WebSocketEventService', () => {
  let service: WebSocketEventService;
  let mockServer: jest.Mocked<Server>;

  beforeEach(() => {
    service = new WebSocketEventService();
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not emit if server is not set', () => {
    service.emitNewTicket('user1', { id: 'ticket1', subject: 'Test' });
    service.emitNewMessage('user1', { ticketId: 'ticket1', ticketSubject: 'Test', content: 'Message' });

    expect(mockServer.to).not.toHaveBeenCalled();
    expect(mockServer.emit).not.toHaveBeenCalled();
  });

  it('should emit new-ticket event when server is set', () => {
    service.setServer(mockServer);

    service.emitNewTicket('user1', { id: 'ticket1', subject: 'Test Subject' });

    expect(mockServer.to).toHaveBeenCalledWith('user:user1');
    expect(mockServer.emit).toHaveBeenCalledWith('new-ticket', {
      ticketId: 'ticket1',
      subject: 'Test Subject',
      timestamp: expect.any(Date),
    });
  });

  it('should emit new-message event when server is set', () => {
    service.setServer(mockServer);

    service.emitNewMessage('user1', {
      ticketId: 'ticket1',
      ticketSubject: 'Test Subject',
      content: 'Message content',
    });

    expect(mockServer.to).toHaveBeenCalledWith('user:user1');
    expect(mockServer.emit).toHaveBeenCalledWith('new-message', {
      ticketId: 'ticket1',
      ticketSubject: 'Test Subject',
      content: 'Message content',
      timestamp: expect.any(Date),
    });
  });

  it('should handle errors gracefully when emitting events', () => {
    const loggerErrorSpy = jest.spyOn(require('@nestjs/common').Logger.prototype, 'error').mockImplementation();
    mockServer.emit = jest.fn().mockImplementation(() => {
      throw new Error('Emit error');
    });

    service.setServer(mockServer);

    service.emitNewTicket('user1', { id: 'ticket1', subject: 'Test' });

    expect(loggerErrorSpy).toHaveBeenCalled();
    loggerErrorSpy.mockRestore();
  });
});


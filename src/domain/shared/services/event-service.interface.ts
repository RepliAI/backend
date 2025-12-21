export const I_EVENT_SERVICE = "I_EVENT_SERVICE";

export interface IEventService {
  emitNewTicket(userId: string, ticket: { id: string; subject: string }): void;
  emitNewMessage(userId: string, message: { ticketId: string; ticketSubject: string; content: string }): void;
}

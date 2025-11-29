import { Ticket } from "../ticket.entity";
import { Message } from "../message.entity";

describe('Ticket Entity', () => {
  it('should create a ticket with initial values', () => {
    const ticket = new Ticket(
      't1',
      'user1',
      'Subject',
      'OPEN',
      new Date('2023-01-01'),
      []
    );

    expect(ticket.id).toBe('t1');
    expect(ticket.userId).toBe('user1');
    expect(ticket.subject).toBe('Subject');
    expect(ticket.status).toBe('OPEN');
    expect(ticket.messages).toEqual([]);
  });

  it('should add a message to the ticket', () => {
    const ticket = new Ticket(
      't1',
      'user1',
      'Subject',
      'OPEN',
      new Date('2023-01-01'),
      []
    );

    const message = new Message(
      'm1',
      't1',
      'g1',
      'client@example.com',
      'support@example.com',
      'Hello world',
      new Date('2023-01-02')
    );

    ticket.addMessage(message);

    expect(ticket.messages.length).toBe(1);
    expect(ticket.messages[0]).toBe(message);
  });

  it('should allow updating the subject', () => {
    const ticket = new Ticket(
      't1',
      'user1',
      'Subject',
      'OPEN',
      new Date(),
      []
    );

    ticket.subject = 'New subject';

    expect(ticket.subject).toBe('New subject');
  });
});
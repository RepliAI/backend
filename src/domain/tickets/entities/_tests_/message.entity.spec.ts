import { Message } from '../message.entity';

describe('Message Entity', () => {
  it('should create a valid message', () => {
    const date = new Date('2023-01-02');

    const message = new Message(
      'm1',
      't1',
      'g1',
      'client@example.com',
      'support@example.com',
      'Hello world',
      date
    );

    expect(message.id).toBe('m1');
    expect(message.ticketId).toBe('t1');
    expect(message.from).toBe('client@example.com');
    expect(message.to).toBe('support@example.com');
    expect(message.content).toBe('Hello world');
    expect(message.date).toBe(date);
  });
});
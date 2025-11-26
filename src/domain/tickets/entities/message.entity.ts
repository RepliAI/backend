export type MessageRole = "customer" | "agent" | "ai";
export class Message {
  constructor(
    public readonly id: string,
    public readonly ticketId: string,
    public readonly from: MessageRole,
    public readonly to: MessageRole,
    public readonly content: string,
    public readonly date: Date,
  ) {}
}
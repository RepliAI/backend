export class Message {
  constructor(
    public readonly id: string,
    public readonly ticketId: string,
    public readonly gmailId: string | null,
    public readonly from: string,
    public readonly to: string,
    public readonly content: string,
    public readonly date: Date,
    public readonly threadId?: string,
  ) {}
}
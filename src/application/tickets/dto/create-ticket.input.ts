export class CreateTicketInput {
  constructor(
    public readonly userId: string,
    public readonly subject: string,
    public readonly content: string,
    public readonly gmailId?: string,
  ) { }
}
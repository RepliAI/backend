export class AddMessageInput {
    constructor(
      public readonly ticketId: string,
      public readonly userId: string,
      public readonly content: string,
      public readonly gmailId?: string,
    ) {}
}
  
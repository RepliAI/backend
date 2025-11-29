export class HandleGmailCallbackInput {
  constructor(
    public readonly code: string,
    public readonly stateUserId: string,
  ) {}
}
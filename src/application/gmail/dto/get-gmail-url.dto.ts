export class GetGmailAuthUrlInput {
  constructor(public readonly userId: string) {}
}

export class GetGmailAuthUrlOutput {
  constructor(public readonly url: string) {}
}
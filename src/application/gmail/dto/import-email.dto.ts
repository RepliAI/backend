export class ImportEmailsInput {
  constructor(public readonly userId: string) {}
}

export class ImportEmailsOutput {
  constructor(public readonly imported: number) {}
}
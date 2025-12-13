import { Inject } from "@nestjs/common";

import { USER_PREFERENCES_REPOSITORY, IUserPreferencesRepository } from "src/domain/user-preferences/repositories/user-preferences.repository";

export class UpdateUserPreferencesInput {
  constructor(
    public readonly tone?: string,
    public readonly signature?: string,
    public readonly autoImport?: boolean,
    public readonly autoAiSend?: boolean,
  ) { }
}

export class UpdateUserPreferencesUseCase {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly repo: IUserPreferencesRepository,
  ) { }

  async execute(userId: string, input: UpdateUserPreferencesInput) {
    return this.repo.upsert(userId, {
      tone: input.tone,
      signature: input.signature,
      autoImport: input.autoImport,
      autoAiSend: input.autoAiSend,
    });
  }
}
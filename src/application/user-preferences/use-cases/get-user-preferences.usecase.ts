import { Inject } from "@nestjs/common";
import { USER_PREFERENCES_REPOSITORY, IUserPreferencesRepository } from "src/domain/user-preferences/repositories/user-preferences.repository";

export class GetUserPreferencesOutput {
  constructor(
    public readonly tone: string,
    public readonly signature: string,
    public readonly autoImport: boolean,
    public readonly autoAiSend: boolean,
  ) {}
}

export class GetUserPreferencesUseCase {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly userPreferencesRepository: IUserPreferencesRepository,
  ) {}

  async execute(userId: string): Promise<GetUserPreferencesOutput> {
    const prefs = await this.userPreferencesRepository.getByUserId(userId);

    return new GetUserPreferencesOutput(
      prefs?.tone ?? "neutral",
      prefs?.signature ?? "",
      prefs?.autoImport ?? false,
      prefs?.autoAiSend ?? false,
    );
  }
}
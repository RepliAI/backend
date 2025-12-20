import { Inject, Injectable } from "@nestjs/common";

import { USER_PREFERENCES_REPOSITORY, IUserPreferencesRepository } from "src/domain/user-preferences/repositories/user-preferences.repository";
import { CheckPlanFeatureUseCase } from 'src/application/plans/use-cases/check-plan-feature.usecase';

export class UpdateUserPreferencesInput {
  constructor(
    public readonly tone?: string,
    public readonly signature?: string,
    public readonly autoImport?: boolean,
    public readonly autoAiSend?: boolean,
  ) { }
}

@Injectable()
export class UpdateUserPreferencesUseCase {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly repo: IUserPreferencesRepository,
    private readonly checkPlanFeature: CheckPlanFeatureUseCase,
  ) { }

  async execute(userId: string, input: UpdateUserPreferencesInput) {
    const existingPrefs = await this.repo.getByUserId(userId);
    
    if (input.autoImport === true) {
      await this.checkPlanFeature.checkAutoImport(userId);
    }
    
    if (input.autoAiSend === true) {
      await this.checkPlanFeature.checkAutoSend(userId);
    }
    
    return this.repo.upsert(userId, {
      tone: input.tone ?? existingPrefs?.tone ?? 'neutral',
      signature: input.signature ?? existingPrefs?.signature ?? '',
      autoImport: input.autoImport ?? existingPrefs?.autoImport ?? false,
      autoAiSend: input.autoAiSend ?? existingPrefs?.autoAiSend ?? false,
    });
  }
}
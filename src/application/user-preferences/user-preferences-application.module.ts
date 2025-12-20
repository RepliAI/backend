import { Module } from "@nestjs/common";

import { UserPreferencesInfrastructureModule } from "src/infrastructure/user-preferences/user-preference-infrastructure.module";

import { GetUserPreferencesUseCase } from "./use-cases/get-user-preferences.usecase";
import { UpdateUserPreferencesUseCase } from "./use-cases/update-user-preferences.usecase";
import { PlansApplicationModule } from "../plans/plan-application.module";

@Module({
  imports: [UserPreferencesInfrastructureModule, PlansApplicationModule],
  providers: [
    GetUserPreferencesUseCase,
    UpdateUserPreferencesUseCase,
  ],
  exports: [
    GetUserPreferencesUseCase,
    UpdateUserPreferencesUseCase,
  ],
})
export class UserPreferencesApplicationModule { }
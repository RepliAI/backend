import { Module } from "@nestjs/common";
import { GetUserPreferencesUseCase } from "./use-cases/get-user-preferences.usecase";
import { UpdateUserPreferencesUseCase } from "./use-cases/update-user-preferences.usecase";
import { UserPreferencesInfrastructureModule } from "src/infrastructure/user-preferences/user-preference-infrastructure.module";

@Module({
  imports: [UserPreferencesInfrastructureModule],
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
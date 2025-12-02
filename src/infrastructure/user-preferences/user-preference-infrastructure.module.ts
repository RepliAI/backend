import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { USER_PREFERENCES_REPOSITORY } from "src/domain/user-preferences/repositories/user-preferences.repository";
import { PrismaUserPreferencesRepository } from "./repositories/prisma-user-preferences.repository";

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: USER_PREFERENCES_REPOSITORY,
      useClass: PrismaUserPreferencesRepository,
    },
  ],
  exports: [
    USER_PREFERENCES_REPOSITORY,
  ],
})
export class UserPreferencesInfrastructureModule {}
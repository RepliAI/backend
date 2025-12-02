import { Module } from '@nestjs/common';

import { UserPreferencesApplicationModule } from 'src/application/user-preferences/user-preferences-application.module';
import { UserPreferencesInfrastructureModule } from 'src/infrastructure/user-preferences/user-preference-infrastructure.module';

import { UserPreferencesController } from './controllers/user-preferences.controller';

@Module({
  imports: [
    UserPreferencesApplicationModule,
    UserPreferencesInfrastructureModule,
  ],
  controllers: [UserPreferencesController],
})
export class UserPreferencesModule {}
import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';

import { GetUserPreferencesUseCase } from 'src/application/user-preferences/use-cases/get-user-preferences.usecase';
import { UpdateUserPreferencesUseCase } from 'src/application/user-preferences/use-cases/update-user-preferences.usecase';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/security/jwt-auth.guard';
import { CurrentUser as CurrentUserType } from '../../shared/types/current-user.interface';
import { UpdateUserPreferencesDto } from '../dto/update-user-preferences.dto';

@Controller('preferences')
export class UserPreferencesController {
  constructor(
    private readonly getUserPrefs: GetUserPreferencesUseCase,
    private readonly updateUserPrefs: UpdateUserPreferencesUseCase,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Get()
  async get(@CurrentUser() user: CurrentUserType): Promise<unknown> {
    return this.getUserPrefs.execute(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async update(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: UpdateUserPreferencesDto,
  ): Promise<unknown> {
    return this.updateUserPrefs.execute(user.userId, dto);
  }
}
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/interfaces/http/auth/security/jwt-auth.guard';
import { UserId } from 'src/interfaces/http/auth/decorators/user-id.decorator';
import { GetStatsUseCase } from 'src/application/stats/use-cases/get-stats.usecase';

@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly getStats: GetStatsUseCase) {}

  @Get()
  async get(
    @UserId() userId: string,
    @Query("days") days?: string
  ) {
    const nbDays = days ? parseInt(days, 10) : 14;
    return this.getStats.execute(userId, nbDays);
  }
}
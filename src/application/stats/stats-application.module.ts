import { Module } from '@nestjs/common';
import { GetStatsUseCase } from './use-cases/get-stats.usecase';
import { StatsInfrastructureModule } from 'src/infrastructure/stats/stats-infrastructure.module';

@Module({
  imports: [StatsInfrastructureModule],
  providers: [GetStatsUseCase],
  exports: [GetStatsUseCase],
})
export class StatsApplicationModule {}
import { Module } from '@nestjs/common';
import { PrismaStatsRepository } from './prisma-stats.repository';
import { STATS_REPOSITORY } from 'src/domain/stats/repositories/stats.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: STATS_REPOSITORY,
      useClass: PrismaStatsRepository,
    },
  ],
  exports: [
    {
      provide: STATS_REPOSITORY,
      useClass: PrismaStatsRepository,
    },
  ],
})
export class StatsInfrastructureModule {}
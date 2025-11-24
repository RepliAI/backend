import { Inject, Injectable } from '@nestjs/common';
import { IStatsRepository, STATS_REPOSITORY } from 'src/domain/stats/repositories/stats.repository';

@Injectable()
export class GetStatsUseCase {
  constructor(
    @Inject(STATS_REPOSITORY)
    private readonly statsRepository: IStatsRepository,
  ) {}

  async execute(userId: string, days: number = 14) {
    return this.statsRepository.getStats(userId, days);
  }
}
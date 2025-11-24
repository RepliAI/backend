import { Module } from "@nestjs/common";
import { StatsController } from "./stats.controller";
import { StatsApplicationModule } from "src/application/stats/stats-application.module";

@Module({
  imports: [StatsApplicationModule],
  controllers: [StatsController],
})
export class StatsHttpModule {}
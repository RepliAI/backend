import { Module } from "@nestjs/common";
import { ID_GENERATOR } from "src/domain/shared/services/id-generator.service";
import { UuidIdGeneratorService } from "./uuid-id-generator.service";

@Module({
  providers: [
    {
      provide: ID_GENERATOR,
      useClass: UuidIdGeneratorService,
    },
  ],
  exports: [ID_GENERATOR],
})
export class IdGeneratorModule {}
import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

import { IIdGenerator } from "src/domain/shared/services/id-generator.service";

@Injectable()
export class UuidGeneratorService implements IIdGenerator {
  generate(): string {
    return randomUUID();
  }
}
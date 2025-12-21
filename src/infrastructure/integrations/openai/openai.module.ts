import { Module } from "@nestjs/common";
import { OpenAiService } from "./openai.service";
import { I_AI_SERVICE } from "src/domain/shared/services/ai-service.interface";

@Module({
  providers: [
    OpenAiService,
    {
      provide: I_AI_SERVICE,
      useExisting: OpenAiService,
    },
  ],
  exports: [I_AI_SERVICE],
})

export class OpenAiModule { }
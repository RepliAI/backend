import { Injectable } from "@nestjs/common";
import OpenAI from "openai";

@Injectable()
export class OpenAiService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateReply({ system, user }: { system: string; user: string }): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    return completion.choices[0].message.content ?? "";
  }
}
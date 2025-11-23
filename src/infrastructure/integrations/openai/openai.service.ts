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

  async generateReply(prompt: string): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "Tu es un assistant support professionnel." },
        { role: "user", content: prompt },
      ],
    });

    return completion.choices[0].message.content ?? "";
  }
}
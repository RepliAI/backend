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

  async isSafeForAutoReply(messageContent: string): Promise<boolean> {
    const moderationPrompt = `
      Tu es un système de modération pour le support client. 
      Analyse le message suivant et détermine s'il est approprié pour une réponse automatique par IA.

      Un message N'EST PAS approprié pour une réponse automatique si :
      - Le client exprime une forte colère, frustration excessive ou agressivité
      - Le message contient des insultes, menaces ou langage offensant
      - Le client menace d'actions légales ou de porter plainte
      - Le message contient un ton extrêmement négatif ou hostile
      - Le client exprime un sentiment de trahison ou de tromperie
      - Le message suggère un problème grave nécessitant une attention humaine immédiate

      Un message EST approprié pour une réponse automatique si :
      - Le ton est neutre, poli ou légèrement frustré mais respectueux
      - Il s'agit d'une question technique ou d'une demande d'information
      - Le client exprime une préoccupation normale sans agressivité
      - Le message est professionnel ou courtois même en cas de problème

      Message à analyser :
      """${messageContent}"""

      Réponds UNIQUEMENT avec un JSON valide au format suivant :
      {
        "safe": true ou false,
        "reason": "brève explication (max 50 caractères)"
      }
    `;

    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: "Tu es un système de modération. Réponds UNIQUEMENT avec un JSON valide.",
          },
          { role: "user", content: moderationPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const response = completion.choices[0].message.content;
      if (!response) return false;

      const analysis = JSON.parse(response);
      return analysis.safe === true;
    } catch (error) {

      console.error("Error in content moderation check:", error);
      return false;
    }
  }
}
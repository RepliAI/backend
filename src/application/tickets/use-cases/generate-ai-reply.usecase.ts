import { Injectable, ForbiddenException, NotFoundException, Inject } from "@nestjs/common";

import { ITicketRepository, TICKET_REPOSITORY } from "src/domain/tickets/repositories/ticket.repository";
import { I_AI_SERVICE, IAiService } from "src/domain/shared/services/ai-service.interface";
import { IUserPreferencesRepository, USER_PREFERENCES_REPOSITORY } from "src/domain/user-preferences/repositories/user-preferences.repository";
import { CheckAiResponseLimitUseCase } from 'src/application/plans/use-cases/check-ai-response-limit.usecase';

@Injectable()
export class GenerateAiReplyUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: ITicketRepository,
    @Inject(I_AI_SERVICE)
    private readonly aiService: IAiService,

    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly prefsRepo: IUserPreferencesRepository,
    private readonly checkAiResponseLimit: CheckAiResponseLimitUseCase,
  ) {}

  async execute(ticketId: string, userId: string): Promise<string> {
    await this.checkAiResponseLimit.execute(userId);
    const ticket = await this.ticketRepository.findById(ticketId, userId);
    if (!ticket) throw new NotFoundException(`Ticket with ID ${ticketId} not found.`);

    const lastMessage = ticket.messages.at(-1);
    if (!lastMessage) throw new ForbiddenException(`Cannot generate reply: no message found on this ticket.`);

    if (!lastMessage.gmailId) {
      throw new ForbiddenException(`Cannot reply: last message has no Gmail ID (required for threading).`);
    }

    const prefs = await this.prefsRepo.getByUserId(userId);

    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.getUserPrompt(lastMessage.content, prefs);

    const aiReply = await this.aiService.generateReply({
      system: systemPrompt,
      user: userPrompt,
    });

    await this.checkAiResponseLimit.incrementUsage(userId);
    
    return aiReply;
  }

  private getUserPrompt(messageContent: string, preferences: any) {
    const tone = preferences?.tone ?? "neutral";
    const signature = preferences?.signature ?? "";

    return `
      userMessage: """${messageContent}"""
      tone: "${tone}"
      signature: """${signature}"""
    `.trim();
  }

  private getSystemPrompt() {
    return `
      Tu es un assistant spécialisé en support client professionnel.  
      Ta mission : rédiger des réponses impeccables, précises, utiles, et adaptées à la situation, selon les paramètres fournis par le système.

      Respecte impérativement les règles suivantes :

      ========================
      ### 1. TONALITÉ (obligatoire)
      Adapte ton style en fonction de la variable \`tone\`.

      #### • tone = "friendly"
      - chaleureux, empathique, conversationnel  
      - phrases plus courtes  
      - approche très humaine et rassurante  
      - autorisé : "Bonne journée", "N'hésitez pas", "Je suis là pour vous aider"  
      - éviter familiarité excessive  

      #### • tone = "neutral"
      - professionnel, clair, direct  
      - pas d’émotion inutile  
      - phrases équilibrées  

      #### • tone = "formal"
      - style soutenu et impersonnel  
      - structure professionnelle  
      - phrases plus longues  
      - vocabulaire précis et formel  

      ========================
      ### 2. STRUCTURE
      1. introduction adaptée  
      2. réponse concrète  
      3. recommandations utiles  
      4. conclusion  
      5. signature si fournie  

      ========================
      ### 3. RÈGLES
      - jamais de contenu inventé  
      - jamais répéter textuellement le message du client  
      - pas d’informations internes  
      - pas d’emojis  
      - pas de remplissage  

      ========================
      ### 4. SIGNATURE
      - si \`signature\` existe → l'ajouter à la fin après une ligne vide  
      - sinon → conclure avec une formule polie adaptée au ton  

      ========================
      ### 5. SORTIE
      - renvoyer uniquement le texte final  
    `.trim();
  }
}
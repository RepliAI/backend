import { Injectable, ForbiddenException, NotFoundException, Inject } from "@nestjs/common";
import { ITicketRepository, TICKET_REPOSITORY } from "src/domain/tickets/repositories/ticket.repository";
import { IIdGenerator, ID_GENERATOR } from "src/domain/shared/services/id-generator.service";
import { Message } from "src/domain/tickets/entities/message.entity";
import { OpenAiService } from "src/infrastructure/integrations/openai/openai.service";

Injectable()

export class GenerateAiReplyUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly ticketRepository: ITicketRepository,
    private readonly openAiService: OpenAiService,
    @Inject(ID_GENERATOR) private readonly idGenerator: IIdGenerator,
  ) {}

  async execute(ticketId: string, userId: string): Promise<string> {
    const ticket = await this.ticketRepository.findById(ticketId, userId);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found.`);
    }

    const lastMessage = ticket.messages[ticket.messages.length - 1];
    if (!lastMessage) {
      throw new ForbiddenException(`No message found for user ${userId}.`);
    }

    const prompt = `
        Tu es un assistant support professionnel.
        Voici le message du client :
        
        "${lastMessage.content}"
        
        Génère une réponse professionnelle, claire et empathique.
    `.trim();
    
    const aiReply = await this.openAiService.generateReply(prompt);

    const newMessage = new Message(
        this.idGenerator.generate(),
        ticket.id,
        "agent",
        lastMessage.from,
        aiReply,
        new Date(),
      );

    ticket.addMessage(newMessage);

    await this.ticketRepository.update(ticket);
  
    return aiReply;
  }
}
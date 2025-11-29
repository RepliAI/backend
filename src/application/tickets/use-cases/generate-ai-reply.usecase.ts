import { Injectable, ForbiddenException, NotFoundException, Inject } from "@nestjs/common";

import { ITicketRepository, TICKET_REPOSITORY } from "src/domain/tickets/repositories/ticket.repository";
import { IIdGenerator, ID_GENERATOR } from "src/domain/shared/services/id-generator.service";
import { Message } from "src/domain/tickets/entities/message.entity";
import { OpenAiService } from "src/infrastructure/integrations/openai/openai.service";

@Injectable()
export class GenerateAiReplyUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: ITicketRepository,
    private readonly openAiService: OpenAiService,
    @Inject(ID_GENERATOR)
    private readonly idGenerator: IIdGenerator
  ) {}

  async execute(ticketId: string, userId: string): Promise<string> {
    const ticket = await this.ticketRepository.findById(ticketId, userId);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found.`);
    }

    const lastMessage = ticket.messages.at(-1);
    if (!lastMessage) {
      throw new ForbiddenException(`Cannot generate reply: no message found on this ticket.`);
    }

    if (!lastMessage.gmailId) {
      throw new ForbiddenException(`Cannot reply: last message has no Gmail ID (required for threading).`);
    }

    const prompt = `
      Tu es un assistant support professionnel.
      Voici le message du client :

      "${lastMessage.content}"

      Génère une réponse professionnelle, claire, concise et empathique.
    `.trim();

    const aiReply = await this.openAiService.generateReply(prompt);

    const newMessage = new Message(
      this.idGenerator.generate(),
      ticket.id,
      null,
      "ai",
      lastMessage.from,
      aiReply,
      new Date()
    );

    await this.ticketRepository.addMessage(ticket.id, newMessage);
    ticket.markPending();
    await this.ticketRepository.updateStatus(ticket.id, ticket.status);
  

    return aiReply;
  }
}
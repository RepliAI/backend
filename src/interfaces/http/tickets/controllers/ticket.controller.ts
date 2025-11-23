import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ListTicketsUseCase } from 'src/application/tickets/use-cases/list-tickets.usecase';
import { GetTicketByIdUseCase } from 'src/application/tickets/use-cases/get-ticket.usecase';
import { GenerateAiReplyUseCase } from 'src/application/tickets/use-cases/generate-ai-reply.usecase';
import { JwtAuthGuard } from '../../auth/security/jwt-auth.guard';
import { TicketResponseDto } from '../dto/ticket-response.dto';
import { UserId } from '../../auth/decorators/user-id.decorator';
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly listTickets: ListTicketsUseCase,
    private readonly getTicketById: GetTicketByIdUseCase,
    private readonly generateAiReply: GenerateAiReplyUseCase,
  ) {}

  @Get()
  async list(@UserId() userId: string): Promise<TicketResponseDto[]> {
    const tickets = await this.listTickets.execute(userId);
    return tickets.map((ticket) => TicketResponseDto.fromDomain(ticket));
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @UserId() userId: string,
  ): Promise<TicketResponseDto> {
    const ticket = await this.getTicketById.execute(id, userId);
    return TicketResponseDto.fromDomain(ticket);
  }

  @Post(":id/generate-reply")
  async generateReply(
    @Param("id") id: string,
    @UserId() userId: string,
  ) {
    const reply = await this.generateAiReply.execute(id, userId);
    return { reply };
  }
}

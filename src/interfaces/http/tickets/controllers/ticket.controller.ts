import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ListTicketsUseCase } from 'src/application/tickets/use-cases/list-tickets.usecase';
import { GetTicketByIdUseCase } from 'src/application/tickets/use-cases/get-ticket.usecase';
import { GenerateAiReplyUseCase } from 'src/application/tickets/use-cases/generate-ai-reply.usecase';
import { CreateTicketInput } from 'src/application/tickets/dto/create-ticket.input';
import { CreateTicketUseCase } from 'src/application/tickets/use-cases/create-ticket.usecase';
import { UpdateTicketStatusDto } from 'src/application/tickets/dto/update-status.dto';
import { UpdateTicketStatusUseCase } from 'src/application/tickets/use-cases/update-status.usecase';
import { JwtAuthGuard } from '../../auth/security/jwt-auth.guard';
import { TicketResponseDto } from '../dto/ticket-response.dto';
import { UserId } from '../../auth/decorators/user-id.decorator';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { AddMessageToTicketUseCase } from 'src/application/tickets/use-cases/add-message.usecase';
import { AddMessageDto } from '../dto/add-messae.dto';
import { MessageResponseDto } from '../dto/message-response.dto';
import { ListTicketsQueryDto } from '../dto/list-tickets-query.dto';
import { ListTicketsResponseDto } from '../dto/list-tickets-response.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly listTickets: ListTicketsUseCase,
    private readonly getTicketById: GetTicketByIdUseCase,
    private readonly generateAiReply: GenerateAiReplyUseCase,
    private readonly createTicket: CreateTicketUseCase,
    private readonly addMessageToTicket: AddMessageToTicketUseCase,
    private readonly updateTicketStatus: UpdateTicketStatusUseCase,
  ) {}

  @Get()
  async list(
    @UserId() userId: string,
    @Query() query: ListTicketsQueryDto,
  ): Promise<ListTicketsResponseDto> {
    const result = await this.listTickets.execute({
      userId,
      status: query.status,
      search: query.search,
      page: query.page,
      pageSize: query.pageSize,
      from: query.from ? new Date(query.from) : undefined,
  to: query.to ? new Date(query.to) : undefined,
    });

    return {
      items: result.items.map(TicketResponseDto.fromDomain),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
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

  @Post()
  async create(
    @UserId() userId: string,
    @Body() dto: CreateTicketDto,
  ) {
    const ticket = await this.createTicket.execute(
      new CreateTicketInput(userId, dto.subject, dto.content),
    );

    return TicketResponseDto.fromDomain(ticket);
  }

  @Post(':id/messages')
  async addMessage(
    @Param('id') id: string,
    @UserId() userId: string,
    @Body() dto: AddMessageDto,
  ): Promise<MessageResponseDto> {
    const message = await this.addMessageToTicket.execute({
      ticketId: id,
      userId,
      content: dto.content,
    });

    return MessageResponseDto.fromDomain(message);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateTicketStatusDto,
    @CurrentUser() user: any
  ) {
    const updated = await this.updateTicketStatus.execute(id, user.id, body.status);
    return TicketResponseDto.fromDomain(updated);
  }
}

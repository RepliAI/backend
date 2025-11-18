import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ListTicketsUseCase } from 'src/application/tickets/use-cases/list-tickets.usecase';
import { GetTicketByIdUseCase } from 'src/application/tickets/use-cases/get-ticket.usecase';
import { JwtAuthGuard } from '../../auth/security/jwt-auth.guard';
import { TicketResponseDto } from '../dto/ticket-response.dto';
import { UserId } from '../../auth/decorators/user-id.decorator';

@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly listTickets: ListTicketsUseCase,
    private readonly getTicketById: GetTicketByIdUseCase,
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
}

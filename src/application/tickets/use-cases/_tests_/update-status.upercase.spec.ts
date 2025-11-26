import { UpdateTicketStatusUseCase } from "../update-status.usecase";
import { createTicketRepoMock } from "../../../../tests/mocks/ticket-repo.mock";
import { Ticket } from "../../../../domain/tickets/entities/ticket.entity";
import { TicketStatus } from "../../../../domain/tickets/value-objects/ticket-status.vo";

describe("UpdateTicketStatusUseCase", () => {
  it("should update the ticket status", async () => {
    const repo = createTicketRepoMock();

    const ticket = new Ticket(
      "t1",
      "user1",
      "Subject",
      TicketStatus.OPEN,
      new Date(),
      []
    );

    repo.findById.mockResolvedValue(ticket);
    repo.update.mockResolvedValue(undefined);

    const useCase = new UpdateTicketStatusUseCase(repo);

    const result = await useCase.execute(
      "user1",
      "t1",
      TicketStatus.CLOSED,
    );

    expect(repo.findById).toHaveBeenCalledWith("user1", "t1");
    expect(ticket.status).toBe(TicketStatus.CLOSED);
    expect(repo.update).toHaveBeenCalledWith(ticket);
    expect(result).toBe(ticket);
  });

  it("should throw if ticket is not found", async () => {
    const repo = createTicketRepoMock();
    repo.findById.mockResolvedValue(null);

    const useCase = new UpdateTicketStatusUseCase(repo);

    await expect(
      useCase.execute(
        "user1",
        "t1",
        TicketStatus.PENDING,
      )
    ).rejects.toThrow("Ticket not found");
  });
});
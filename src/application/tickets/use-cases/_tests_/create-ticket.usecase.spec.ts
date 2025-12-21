import { CreateTicketUseCase } from "../create-ticket.usecase";
import { createTicketRepoMock } from "src/tests/mocks/ticket-repo.mock";
import { createIdGeneratorMock } from "src/tests/mocks/id-generalor.mock";
import { createAiServiceMock } from "src/tests/mocks/ai-service.mock";
import { createEventServiceMock } from "src/tests/mocks/event-service.mock";
import { Ticket } from "src/domain/tickets/entities/ticket.entity";
import { Message } from "src/domain/tickets/entities/message.entity";

describe("CreateTicketUseCase", () => {
  let useCase: CreateTicketUseCase;
  let ticketRepository: ReturnType<typeof createTicketRepoMock>;
  let idGenerator: ReturnType<typeof createIdGeneratorMock>;
  let aiService: ReturnType<typeof createAiServiceMock>;
  let eventService: ReturnType<typeof createEventServiceMock>;

  beforeEach(() => {
    ticketRepository = createTicketRepoMock();
    idGenerator = createIdGeneratorMock();
    aiService = createAiServiceMock();
    eventService = createEventServiceMock();

    idGenerator.generate
      .mockReturnValueOnce("ticket123")
      .mockReturnValueOnce("msg123");

    useCase = new CreateTicketUseCase(
      ticketRepository,
      idGenerator,
      aiService,
      eventService,
    );
  });

  it("should create a ticket with a first message", async () => {
    aiService.isSafeForAutoReply.mockResolvedValue(true);

    await useCase.execute({
      userId: "user1",
      subject: "Test Subject",
      content: "Hello world"
    });

    expect(ticketRepository.create).toHaveBeenCalledTimes(1);

    const savedTicket = ticketRepository.create.mock.calls[0][0];
    expect(savedTicket).toBeInstanceOf(Ticket);
    expect(savedTicket.id).toBe("ticket123");
    expect(savedTicket.subject).toBe("Test Subject");

    expect(savedTicket.messages.length).toBe(1);

    const message = savedTicket.messages[0];
    expect(message).toBeInstanceOf(Message);
    expect(message.id).toBe("msg123");
    expect(message.content).toBe("Hello world");
    expect(message.from).toBe("customer");
    expect(message.to).toBe("agent");

    expect(aiService.isSafeForAutoReply).toHaveBeenCalledWith("Hello world");
    expect(eventService.emitNewTicket).toHaveBeenCalledWith("user1", {
      id: "ticket123",
      subject: "Test Subject",
    });
  });

  it("should mark message as risky when content is not safe", async () => {
    aiService.isSafeForAutoReply.mockResolvedValue(false);

    await useCase.execute({
      userId: "user1",
      subject: "Test Subject",
      content: "I am very angry!"
    });

    expect(aiService.isSafeForAutoReply).toHaveBeenCalledWith("I am very angry!");
    expect(ticketRepository.markMessageAsRisky).toHaveBeenCalledWith("msg123");
    expect(eventService.emitNewTicket).toHaveBeenCalled();
  });
});
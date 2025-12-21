import { PrismaTicketRepository } from '../prisma-ticket.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { TicketStatus } from '../../../domain/tickets/value-objects/ticket-status.vo';

describe('PrismaTicketRepository - listWithFilters', () => {
  let repository: PrismaTicketRepository;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      ticket: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    } as any;

    (prisma.$transaction as jest.Mock).mockImplementation(async (queries: any) => {
      if (Array.isArray(queries)) {
        return await Promise.all(queries);
      }
      return queries;
    });

    repository = new PrismaTicketRepository(prisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should filter tickets by isRisky when isRisky is true', async () => {
    const mockTickets = [
      {
        id: 't1',
        userId: 'user1',
        subject: 'Ticket 1',
        status: TicketStatus.OPEN,
        createdAt: new Date(),
        messages: [
          {
            id: 'm1',
            ticketId: 't1',
            gmailId: 'g1',
            from: 'customer',
            to: 'agent',
            content: 'Message 1',
            date: new Date(),
            threadId: 'th1',
            isRisky: true,
          },
        ],
      },
    ];


    (prisma.ticket.findMany as jest.Mock).mockResolvedValue(mockTickets);
    (prisma.ticket.count as jest.Mock).mockResolvedValue(1);

    await repository.listWithFilters({
      userId: 'user1',
      page: 1,
      pageSize: 10,
      isRisky: true,
    });

    expect(prisma.ticket.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          { userId: 'user1' },
          {
            messages: {
              some: {
                isRisky: true,
              },
            },
          },
        ],
      },
      include: { messages: true },
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 10,
    });
  });

  it('should combine isRisky filter with status filter', async () => {
    const mockTickets = [
      {
        id: 't1',
        userId: 'user1',
        subject: 'Ticket 1',
        status: TicketStatus.OPEN,
        createdAt: new Date(),
        messages: [
          {
            id: 'm1',
            ticketId: 't1',
            gmailId: 'g1',
            from: 'customer',
            to: 'agent',
            content: 'Message 1',
            date: new Date(),
            threadId: 'th1',
            isRisky: true,
          },
        ],
      },
    ];

    (prisma.ticket.findMany as jest.Mock).mockResolvedValue(mockTickets);
    (prisma.ticket.count as jest.Mock).mockResolvedValue(1);

    await repository.listWithFilters({
      userId: 'user1',
      page: 1,
      pageSize: 10,
      status: TicketStatus.OPEN,
      isRisky: true,
    });

    const findManyCall = (prisma.ticket.findMany as jest.Mock).mock.calls[0][0];
    
    expect(findManyCall.where).toEqual({
      AND: [
        { userId: 'user1' },
        { status: TicketStatus.OPEN },
        {
          messages: {
            some: {
              isRisky: true,
            },
          },
        },
      ],
    });
  });

  it('should combine isRisky filter with search filter', async () => {
    const mockTickets = [
      {
        id: 't1',
        userId: 'user1',
        subject: 'Ticket 1',
        status: TicketStatus.OPEN,
        createdAt: new Date(),
        messages: [
          {
            id: 'm1',
            ticketId: 't1',
            gmailId: 'g1',
            from: 'customer',
            to: 'agent',
            content: 'Message 1',
            date: new Date(),
            threadId: 'th1',
            isRisky: true,
          },
        ],
      },
    ];


    (prisma.ticket.findMany as jest.Mock).mockResolvedValue(mockTickets);
    (prisma.ticket.count as jest.Mock).mockResolvedValue(1);

    await repository.listWithFilters({
      userId: 'user1',
      page: 1,
      pageSize: 10,
      search: 'test',
      isRisky: true,
    });

    const findManyCall = (prisma.ticket.findMany as jest.Mock).mock.calls[0][0];
    
    expect(findManyCall.where.AND).toHaveLength(3);
    expect(findManyCall.where.AND[0]).toEqual({ userId: 'user1' });
    expect(findManyCall.where.AND[1]).toEqual({
      messages: {
        some: {
          isRisky: true,
        },
      },
    });
    expect(findManyCall.where.AND[2]).toEqual({
      OR: [
        { subject: { contains: 'test', mode: 'insensitive' } },
        {
          messages: {
            some: {
              AND: [
                { isRisky: true },
                { content: { contains: 'test', mode: 'insensitive' } },
              ],
            },
          },
        },
      ],
    });
  });

  it('should combine isRisky, status, and search filters', async () => {
    const mockTickets = [
      {
        id: 't1',
        userId: 'user1',
        subject: 'Ticket 1',
        status: TicketStatus.OPEN,
        createdAt: new Date(),
        messages: [
          {
            id: 'm1',
            ticketId: 't1',
            gmailId: 'g1',
            from: 'customer',
            to: 'agent',
            content: 'Message 1',
            date: new Date(),
            threadId: 'th1',
            isRisky: true,
          },
        ],
      },
    ];


    (prisma.ticket.findMany as jest.Mock).mockResolvedValue(mockTickets);
    (prisma.ticket.count as jest.Mock).mockResolvedValue(1);

    await repository.listWithFilters({
      userId: 'user1',
      page: 1,
      pageSize: 10,
      status: TicketStatus.OPEN,
      search: 'test',
      isRisky: true,
    });

    const findManyCall = (prisma.ticket.findMany as jest.Mock).mock.calls[0][0];
    
    expect(findManyCall.where.AND).toHaveLength(4);
    expect(findManyCall.where.AND[0]).toEqual({ userId: 'user1' });
    expect(findManyCall.where.AND[1]).toEqual({ status: TicketStatus.OPEN });
    expect(findManyCall.where.AND[2]).toEqual({
      messages: {
        some: {
          isRisky: true,
        },
      },
    });
    expect(findManyCall.where.AND[3]).toEqual({
      OR: [
        { subject: { contains: 'test', mode: 'insensitive' } },
        {
          messages: {
            some: {
              AND: [
                { isRisky: true },
                { content: { contains: 'test', mode: 'insensitive' } },
              ],
            },
          },
        },
      ],
    });
  });

  it('should not filter by isRisky when isRisky is undefined', async () => {
    const mockTickets = [
      {
        id: 't1',
        userId: 'user1',
        subject: 'Ticket 1',
        status: TicketStatus.OPEN,
        createdAt: new Date(),
        messages: [],
      },
    ];


    (prisma.ticket.findMany as jest.Mock).mockResolvedValue(mockTickets);
    (prisma.ticket.count as jest.Mock).mockResolvedValue(1);

    await repository.listWithFilters({
      userId: 'user1',
      page: 1,
      pageSize: 10,
      isRisky: undefined,
    });

    const findManyCall = (prisma.ticket.findMany as jest.Mock).mock.calls[0][0];
    
    expect(findManyCall.where).toEqual({ userId: 'user1' });
  });

  it('should not filter by isRisky when isRisky is false', async () => {
    const mockTickets = [
      {
        id: 't1',
        userId: 'user1',
        subject: 'Ticket 1',
        status: TicketStatus.OPEN,
        createdAt: new Date(),
        messages: [],
      },
    ];


    (prisma.ticket.findMany as jest.Mock).mockResolvedValue(mockTickets);
    (prisma.ticket.count as jest.Mock).mockResolvedValue(1);

    await repository.listWithFilters({
      userId: 'user1',
      page: 1,
      pageSize: 10,
      isRisky: false as any,
    });

    const findManyCall = (prisma.ticket.findMany as jest.Mock).mock.calls[0][0];
    
    expect(findManyCall.where).toEqual({ userId: 'user1' });
  });
});


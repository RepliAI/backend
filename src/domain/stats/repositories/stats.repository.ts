export interface TicketStats {
  total: number;
  open: number;
  pending: number;
  resolved: number;
  lastTickets: {
    id: string;
    subject: string;
    createdAt: Date;
  }[];
  period: {
    from: Date;
    to: Date;
    tickets: {
      id: string;
      subject: string;
      createdAt: Date;
    }[];
  };
}

export const STATS_REPOSITORY = Symbol("STATS_REPOSITORY");

export interface IStatsRepository {
  getStats(userId: string, days: number): Promise<TicketStats>;
}

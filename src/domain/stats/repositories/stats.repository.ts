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
}
  
export const STATS_REPOSITORY = Symbol("STATS_REPOSITORY");
  
export interface IStatsRepository {
  getStats(userId: string): Promise<TicketStats>;
}
import { Injectable, Logger } from "@nestjs/common";
import { Server } from "socket.io";
import { IEventService } from "src/domain/shared/services/event-service.interface";

@Injectable()
export class WebSocketEventService implements IEventService {
    private server: Server;
    private readonly logger = new Logger(WebSocketEventService.name);

    setServer(server: Server) {
        this.server = server;
        this.logger.log('WebSocket server set in event service');
    }

    emitNewTicket(userId: string, ticket: { id: string, subject: string }) {
        if (!this.server) {
            return;
        }
        try {
            this.server.to(`user:${userId}`).emit('new-ticket', {
                ticketId: ticket.id,
                subject: ticket.subject,
                timestamp: new Date(),
            });
        } catch (error) {
            this.logger.error(`Error emitting new-ticket event: ${error.message}`, error.stack);
        }
    }

    emitNewMessage(userId: string, message: { ticketId: string, ticketSubject: string, content: string }) {
        if (!this.server) {
            return;
        }
        
        try {
            this.server.to(`user:${userId}`).emit('new-message', {
                ticketId: message.ticketId,
                ticketSubject: message.ticketSubject,
                content: message.content,
                timestamp: new Date(),
            });
        } catch (error) {
            this.logger.error(`Error emitting new-message event: ${error.message}`, error.stack);
        }
    }
}
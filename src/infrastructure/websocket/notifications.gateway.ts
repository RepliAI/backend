import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WebSocketEventService } from './websocket-event.service';

interface AuthenticatedSocket extends Socket {
    userId?: string;
}

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    },
    namespace: '/notifications',
})
export class NotificationsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(NotificationsGateway.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly eventService: WebSocketEventService,
    ) { }

    afterInit(server: Server) {
        this.eventService.setServer(server);
        this.logger.log('WebSocket Gateway initialized');
    }

    async handleConnection(@ConnectedSocket() client: AuthenticatedSocket) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                this.logger.warn(`Connection rejected: no token provided`);
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_ACCESS_SECRET,
            });

            client.userId = payload.userId;
            client.join(`user:${payload.userId}`);

            this.logger.log(`Client connected: ${client.id} (user: ${payload.userId})`);
        } catch (error) {
            this.logger.error(`Connection error: ${error.message}`);
            client.disconnect();
        }
    }

    handleDisconnect(@ConnectedSocket() client: AuthenticatedSocket) {
        if (client.userId) {
            this.logger.log(`Client disconnected: ${client.id} (user: ${client.userId})`);
        }
    }
}
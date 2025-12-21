import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsGateway } from './notifications.gateway';
import { WebSocketEventService } from './websocket-event.service';
import { I_EVENT_SERVICE } from 'src/domain/shared/services/event-service.interface';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_ACCESS_SECRET,
        }),
    ],
  providers: [
    NotificationsGateway,
    WebSocketEventService,
    {
      provide: I_EVENT_SERVICE,
      useExisting: WebSocketEventService,
    },
  ],
  exports: [I_EVENT_SERVICE],
})

export class WebSocketModule { }
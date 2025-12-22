import { NestFactory } from '@nestjs/core';
import * as bodyParser from "body-parser";
import { IoAdapter } from '@nestjs/platform-socket.io';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
    exposedHeaders: ['X-New-Access-Token', 'X-New-Refresh-Token'],
  });
  
  app.useWebSocketAdapter(new IoAdapter(app));
  app.use('/billing/webhook', bodyParser.raw({ type: "*/*" }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
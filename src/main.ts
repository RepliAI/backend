import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from "body-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use('/billing/webhook', bodyParser.raw({ type: "*/*" }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

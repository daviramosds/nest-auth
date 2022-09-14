import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as expressListRoutes from 'express-list-routes';
import { AppModule } from './app.module';
import './auth/passport';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      sub: string;
      iat: number;
      exp: number;
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3333);

  expressListRoutes(app.getHttpServer()._events.request._router);
}
bootstrap();

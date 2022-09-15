/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-empty-interface */

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { User as UserInterface } from '@prisma/client';
import * as expressListRoutes from 'express-list-routes';
import { AppModule } from './app.module';

declare global {
  namespace Express {
    export interface User extends UserInterface {}
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

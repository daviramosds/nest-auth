/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-empty-interface */

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { User as UserInterface } from '@prisma/client';

// import * as expressListRoutes from 'express-list-routes';
import * as compression from 'compression';
import * as csurf from 'csurf';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import helmet from 'helmet';

declare global {
  namespace Express {
    export interface User extends UserInterface {}
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.use(helmet());
  app.use(compression());
  // app.use(csurf());

  app.useGlobalPipes(new ValidationPipe());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nest Auth API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT || 3333);

  // expressListRoutes(app.getHttpServer()._events.request._router);
}
bootstrap();

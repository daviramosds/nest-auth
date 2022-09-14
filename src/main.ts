import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as expressListRoutes from 'express-list-routes';
import { AppModule } from './app.module';
import { Prisma } from '@prisma/client';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      id: boolean;
      name: boolean;
      lastname: boolean;
      username: boolean;
      email: boolean;
      password: boolean;
      profile: boolean;
      banner: boolean;
      verification: {
        status: boolean;
        token: string;
        tokenExpires: Date;
      };
    }
  }
}

// Prisma.UserSelect;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3333);

  expressListRoutes(app.getHttpServer()._events.request._router);
}
bootstrap();

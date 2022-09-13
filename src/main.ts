import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as expressListRoutes from 'express-list-routes';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  app.use(
    session({
      // secret: 'my-secret',
      // resave: false,
      // saveUninitialized: false,
      // name: 'my_session',
      // cookie: {
      //   maxAge: 60000,
      // },
      name: 'AUTH_SESSION',
      secret: '123',
      saveUninitialized: true,
      resave: true,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      },
    }),
  );

  await app.listen(3333);

  expressListRoutes(app.getHttpServer()._events.request._router);
}
bootstrap();
